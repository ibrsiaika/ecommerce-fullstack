import mongoose from 'mongoose';
import { Request } from 'express';
import { FraudDetectionService } from './FraudDetectionService';
import { RiskScoreService } from './RiskScoreService';
import { BehaviorAnalysisService } from './BehaviorAnalysisService';
import { DeviceRiskProfile } from '../models/DeviceRiskProfile';
import { FraudAlert, FraudAlertType, FraudRiskLevel } from '../models/FraudAlert';

/**
 * OrderFraudIntegration
 * 
 * Integrates fraud detection into the order creation flow
 * Called right after order validation but before payment processing
 * 
 * Process:
 * 1. Detect fraud signals (velocity, duplicates, behavior, etc.)
 * 2. Calculate composite risk score
 * 3. Make decision: ALLOW | BLOCK | REQUIRE_VERIFICATION
 * 4. Record behavior patterns for future anomaly detection
 * 5. Update device risk profile
 */

export interface OrderFraudCheckResult {
  approved: boolean;
  requiresVerification: boolean;
  riskScore: number;
  riskLevel: FraudRiskLevel;
  fraudAlert?: any;
  reasons: string[];
}

export class OrderFraudIntegration {
  /**
   * Check fraud risk for an incoming order
   * This is the main entry point - called during order creation
   */
  static async checkOrderFraud(
    userId: mongoose.Types.ObjectId,
    user: { email: string },
    order: {
      items: any[];
      totalPrice: number;
      shippingAddress: { country: string };
      paymentMethod: string;
    },
    req: Request
  ): Promise<OrderFraudCheckResult> {
    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = this.generateDeviceId(userAgent, ipAddress);
    const orderAmount = order.totalPrice;
    const category = this.getOrderCategory(order.items);
    const timeOfDay = new Date().getHours();
    const shippingCountry = order.shippingAddress.country;

    // Run fraud detection in parallel
    const [detectionResult, riskScoreBreakdown] = await Promise.all([
      FraudDetectionService.detectFraud({
        userId,
        email: user.email,
        userAgent,
        ipAddress,
        deviceId,
        contextType: 'order',
        contextData: {
          amount: orderAmount,
          items: order.items,
          category,
          shippingCountry,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          shippingMethod: 'standard', // TODO: Get from request
        },
        req,
      }),
      RiskScoreService.calculateRiskScore({
        userId,
        deviceId,
        transactionAmount: orderAmount,
        paymentMethod: order.paymentMethod,
      }),
    ]);

    // Make decision based on risk
    let approved = true;
    let requiresVerification = false;

    const reasons: string[] = [];
    reasons.push(`Risk Score: ${detectionResult.riskScore}/100`);
    reasons.push(...detectionResult.signals.map((s) => `${s.type}: ${s.score} points`));

    // CRITICAL risk = block
    if (detectionResult.riskLevel === FraudRiskLevel.CRITICAL || detectionResult.shouldBlock) {
      approved = false;
      reasons.push('Order blocked due to critical fraud risk');
    }
    // HIGH risk = require verification
    else if (detectionResult.riskLevel === FraudRiskLevel.HIGH || detectionResult.shouldReview) {
      requiresVerification = true;
      reasons.push('Additional verification required');
    }

    // Update device risk profile
    await this.updateDeviceProfile(deviceId, userId, {
      orderAmount,
      ipAddress,
      success: approved || requiresVerification, // Assume success if not blocked
    });

    // Record behavior patterns (only if order is approved or under review)
    if (approved || requiresVerification) {
      await Promise.all([
        BehaviorAnalysisService.recordOrder(userId, orderAmount, category, shippingCountry, timeOfDay),
        BehaviorAnalysisService.recordLogin(userId, deviceId, shippingCountry, Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
      ]);
    }

    const result: OrderFraudCheckResult = {
      approved,
      requiresVerification,
      riskScore: detectionResult.riskScore,
      riskLevel: detectionResult.riskLevel,
      reasons,
    };

    // Include fraud alert if one was created
    if (detectionResult.riskScore >= 40) {
      result.fraudAlert = {
        status: approved ? 'flagged' : 'blocked',
        score: detectionResult.riskScore,
      };
    }

    return result;
  }

  /**
   * Record successful order completion
   * Updates behavior patterns to reflect legitimate transaction
   */
  static async recordOrderSuccess(
    userId: mongoose.Types.ObjectId,
    order: {
      totalPrice: number;
      shippingAddress: { country: string };
    }
  ): Promise<void> {
    // Update behavior patterns to reflect successful order
    await BehaviorAnalysisService.recordOrder(
      userId,
      order.totalPrice,
      'general', // Category not available here
      order.shippingAddress.country,
      new Date().getHours()
    );
  }

  /**
   * Record refund event
   * Updates behavior patterns and checks for refund fraud
   */
  static async recordOrderRefund(
    userId: mongoose.Types.ObjectId,
    orderId: mongoose.Types.ObjectId,
    refundAmount: number,
    reason: string
  ): Promise<{
    refundRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
  }> {
    // Record refund in behavior patterns
    await BehaviorAnalysisService.recordRefund(userId, refundAmount, reason);

    // Analyze refund patterns
    const refundAnalysis = await BehaviorAnalysisService.analyzeRefundPattern(userId);

    // If refund fraud risk is detected, create fraud alert
    if (refundAnalysis.riskLevel === 'high' || refundAnalysis.riskLevel === 'critical') {
      await FraudAlert.createAlert(
        FraudAlertType.REFUND_FRAUD,
        userId,
        'unknown@example.com',
        refundAnalysis.riskLevel === 'critical' ? 85 : 65,
        [
          {
            signalType: 'refund_pattern',
            severity: refundAnalysis.riskLevel,
            score: refundAnalysis.riskLevel === 'critical' ? 40 : 25,
            details: { refundRate: refundAnalysis.refundRate, orderId },
            detectedAt: new Date(),
          },
        ],
        'refund',
        {
          orderId,
          refundAmount,
          reason,
        },
        'automated',
        {}
      );
    }

    return refundAnalysis;
  }

  /**
   * Update device risk profile after transaction
   */
  private static async updateDeviceProfile(
    deviceId: string,
    userId: mongoose.Types.ObjectId,
    transactionData: {
      orderAmount: number;
      ipAddress: string;
      success: boolean;
    }
  ): Promise<void> {
    const device = await DeviceRiskProfile.findOrCreateByDeviceId(deviceId);

    // Record payment with this device
    await device.recordPayment(
      transactionData.orderAmount,
      'card_****', // Card last 4 would come from actual payment
      transactionData.success,
      transactionData.success ? undefined : 'declined'
    );

    // Update risk score
    await device.calculateRiskScore();
  }

  /**
   * Generate a consistent device ID from user agent and IP
   * This is a simple hash-based approach for demo
   * In production, use proper device fingerprinting library
   */
  private static generateDeviceId(userAgent: string, ipAddress: string): string {
    const crypto = require('crypto');
    const combined = `${userAgent}:${ipAddress}`;
    return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32);
  }

  /**
   * Extract primary product category from order items
   */
  private static getOrderCategory(items: any[]): string {
    if (!items || items.length === 0) return 'general';
    // In real implementation, would use actual product categories
    return items[0].category || 'general';
  }

  /**
   * Require additional verification for high-risk orders
   * Could be email verification, phone call, 2FA, etc.
   */
  static async requireVerification(
    userId: mongoose.Types.ObjectId,
    verificationType: 'email' | 'phone' | '2fa' | 'address'
  ): Promise<{
    verificationToken: string;
    expiresAt: Date;
    method: string;
  }> {
    // TODO: Implement verification token generation and storage
    // For now, return placeholder

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const token = require('crypto').randomBytes(32).toString('hex');

    return {
      verificationToken: token,
      expiresAt,
      method: verificationType,
    };
  }

  /**
   * Process payment with fraud result
   * Decides whether to process payment or hold for review
   */
  static async processPaymentWithFraudCheck(
    userId: mongoose.Types.ObjectId,
    fraudCheckResult: OrderFraudCheckResult
  ): Promise<{
    canProcess: boolean;
    paymentStatus: 'approved' | 'pending_review' | 'blocked';
    reason: string;
  }> {
    if (fraudCheckResult.approved && !fraudCheckResult.requiresVerification) {
      return {
        canProcess: true,
        paymentStatus: 'approved',
        reason: 'Low fraud risk - payment approved',
      };
    } else if (fraudCheckResult.requiresVerification) {
      return {
        canProcess: false,
        paymentStatus: 'pending_review',
        reason: 'Medium fraud risk - requires additional verification',
      };
    } else {
      return {
        canProcess: false,
        paymentStatus: 'blocked',
        reason: 'High fraud risk - transaction blocked',
      };
    }
  }
}
