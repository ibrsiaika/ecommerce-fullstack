import mongoose from 'mongoose';
import { BehaviorPattern, OrderPattern, RefundPattern } from '../models/BehaviorPattern';

/**
 * BehaviorAnalysisService
 * 
 * Machine learning-based behavior analysis
 * 
 * Key Concepts:
 * 1. BASELINE ESTABLISHMENT
 *    - Collects data from user's first 5+ orders/actions
 *    - Calculates statistics: mean, stddev, frequency
 *    - Learns preferred patterns: shipping address, payment method, time of day
 * 
 * 2. PATTERN DETECTION
 *    - Order value: Too high or too low vs baseline
 *    - Frequency: Too many orders in short time
 *    - Payment method: New method (potential stolen card)
 *    - Shipping: New country or address
 *    - Time: Orders at unusual hours
 *    - Categories: Different product preferences
 * 
 * 3. ANOMALY SCORING
 *    - Simple ML approach using standard deviation
 *    - High deviation = anomaly
 *    - Example: If avg order is $100 ± $50, order of $500 = 8 std devs = ANOMALY
 * 
 * 4. CONTINUOUS LEARNING
 *    - Updates baseline after each legitimate order
 *    - Weights recent behavior higher
 *    - Gradually adapts to user's changing preferences
 */

export class BehaviorAnalysisService {
  /**
   * Record a new order and update user's behavior pattern
   */
  static async recordOrder(
    userId: mongoose.Types.ObjectId,
    amount: number,
    category: string,
    shippingCountry: string,
    timeOfDay: number
  ): Promise<void> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);

    // Call model method to record order
    await pattern.recordOrder(amount, category, shippingCountry, timeOfDay);
  }

  /**
   * Record a refund event
   */
  static async recordRefund(
    userId: mongoose.Types.ObjectId,
    amount: number,
    reason: string
  ): Promise<void> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);
    await pattern.recordRefund(amount, reason);
  }

  /**
   * Record a payment event (new payment method, success/failure)
   */
  static async recordPayment(userId: mongoose.Types.ObjectId, method: string, success: boolean): Promise<void> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);
    await pattern.recordPayment(method, success);
  }

  /**
   * Record a login event
   */
  static async recordLogin(
    userId: mongoose.Types.ObjectId,
    deviceId: string,
    country: string,
    timezone: string
  ): Promise<void> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);
    await pattern.recordLogin(deviceId, country, timezone);
  }

  /**
   * Check if user behavior is anomalous
   * Returns anomaly score (0-100) and specific anomalies detected
   */
  static async detectAnomalies(userId: mongoose.Types.ObjectId): Promise<{
    isAnomaly: boolean;
    anomalyScore: number;
    anomalies: string[];
  }> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);

    if (!pattern.hasConfidentBaseline()) {
      return {
        isAnomaly: false,
        anomalyScore: 0,
        anomalies: ['Insufficient data to detect anomalies'],
      };
    }

    // Calculate anomaly score and detect specific anomalies
    const anomalyScore = await pattern.calculateAnomalyScore();
    const anomalies = await pattern.detectAnomalies();

    return {
      isAnomaly: anomalyScore > 40,
      anomalyScore,
      anomalies,
    };
  }

  /**
   * Get user's baseline patterns for display/analysis
   */
  static async getBaselinePatterns(userId: mongoose.Types.ObjectId): Promise<any> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);

    return {
      hasConfidentBaseline: pattern.hasConfidentBaseline(),
      totalOrders: pattern.orderCount,
      ordering: {
        averageOrderValue: pattern.orders.avgValue,
        minOrderValue: pattern.orders.minValue,
        maxOrderValue: pattern.orders.maxValue,
        standardDeviation: pattern.orders.stdDev,
        ordersPerDay: (pattern.orders.count / Math.max(1, pattern.orderCount)) || 0,
        preferredDaysOfWeek: pattern.orders.daysActiveDuringWeek,
        preferredTimeOfDay: pattern.orders.avgTimeOfDayHour,
      },
      refunds: {
        totalRefunds: pattern.refunds.count,
        refundRate: pattern.refunds.rate,
        averageRefundValue: pattern.refunds.avgRefundValue,
        topRefundReasons: pattern.refunds.topReasons,
      },
      payments: {
        preferredMethods: pattern.payments.preferredPaymentMethods,
        declinedPayments: pattern.payments.declinedPayments,
        declineRate: pattern.payments.declineRate,
      },
      shipping: {
        preferredAddresses: pattern.shipping.preferredAddresses,
        preferredCarrier: pattern.shipping.preferredCarrier,
        expressShippingRate: pattern.shipping.expressShippingRate,
      },
      products: {
        preferredCategories: pattern.products.preferredCategories,
        priceRange: {
          min: pattern.products.priceRange.min,
          max: pattern.products.priceRange.max,
        },
      },
      login: {
        averageLoginFrequency: pattern.logins.avgLoginFrequency,
        preferredDevices: pattern.logins.preferredDevices,
        preferredCountries: pattern.logins.preferredCountries,
        preferredTimezone: pattern.logins.preferredTimezone,
        failureRate: pattern.logins.failureRate,
      },
    };
  }

  /**
   * Compare current transaction to user's baseline
   * Useful for real-time fraud detection
   */
  static async compareToBaseline(
    userId: mongoose.Types.ObjectId,
    transactionData: {
      amount?: number;
      category?: string;
      country?: string;
      timeOfDay?: number;
      paymentMethod?: string;
    }
  ): Promise<{
    deviations: string[];
    anomalyScore: number;
    isAnomalous: boolean;
  }> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);

    if (!pattern.hasConfidentBaseline()) {
      return {
        deviations: ['Insufficient data to compare'],
        anomalyScore: 0,
        isAnomalous: false,
      };
    }

    const deviations: string[] = [];
    let anomalyScore = 0;

    // Check order amount
    if (transactionData.amount) {
      const stdDev = pattern.orders.stdDev || 50;
      const avgValue = pattern.orders.avgValue;
      const deviation = Math.abs(transactionData.amount - avgValue) / stdDev;

      if (deviation > 3) {
        // 3 standard deviations = anomaly
        deviations.push(`Order amount $${transactionData.amount} is ${deviation.toFixed(1)} std devs above baseline`);
        anomalyScore += 30;
      } else if (deviation > 2) {
        deviations.push(`Order amount slightly unusual (${deviation.toFixed(1)} std devs)`);
        anomalyScore += 15;
      }
    }

    // Check product category
    if (transactionData.category) {
      const preferredCategories = pattern.products.preferredCategories.map((c) => c.category);
      if (!preferredCategories.includes(transactionData.category)) {
        deviations.push(`Unusual product category: ${transactionData.category}`);
        anomalyScore += 10;
      }
    }

    // Check shipping country
    if (transactionData.country) {
      const preferredAddresses = pattern.shipping.preferredAddresses || [];
      const hasCountry = preferredAddresses.some((a) => a.country === transactionData.country);
      if (!hasCountry && pattern.orderCount > 5) {
        deviations.push(`New shipping country: ${transactionData.country}`);
        anomalyScore += 15;
      }
    }

    // Check time of day
    if (transactionData.timeOfDay !== undefined) {
      const avgTime = pattern.orders.avgTimeOfDayHour || 12;
      const timeDiff = Math.abs(transactionData.timeOfDay - avgTime);
      if (timeDiff > 8) {
        deviations.push(`Unusual time of day: ${transactionData.timeOfDay}:00 (baseline: ${avgTime}:00)`);
        anomalyScore += 10;
      }
    }

    // Check payment method
    if (transactionData.paymentMethod) {
      const preferredMethods = pattern.payments.preferredPaymentMethods.map((m: { method: string; cardBrand?: string; count: number; successRate: number }) => m.method);
      if (!preferredMethods.includes(transactionData.paymentMethod as string)) {
        deviations.push(`New payment method: ${transactionData.paymentMethod}`);
        anomalyScore += 20;
      }
    }

    return {
      deviations,
      anomalyScore: Math.min(anomalyScore, 100),
      isAnomalous: anomalyScore > 40,
    };
  }

  /**
   * Analyze refund patterns for refund fraud detection
   */
  static async analyzeRefundPattern(userId: mongoose.Types.ObjectId): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    refundRate: number;
    indicators: string[];
  }> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);
    const indicators: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    const refundRate = pattern.refunds.rate;

    if (refundRate > 0.8) {
      riskLevel = 'critical';
      indicators.push(`Very high refund rate: ${(refundRate * 100).toFixed(1)}%`);
    } else if (refundRate > 0.5) {
      riskLevel = 'high';
      indicators.push(`High refund rate: ${(refundRate * 100).toFixed(1)}%`);
    } else if (refundRate > 0.3) {
      riskLevel = 'medium';
      indicators.push(`Elevated refund rate: ${(refundRate * 100).toFixed(1)}%`);
    }

    // Check for specific refund fraud patterns
    if (pattern.refunds.topReasons.length > 0) {
      const topReason = pattern.refunds.topReasons[0];
      if (topReason.reason === 'quality' && topReason.count > pattern.orders.count * 0.3) {
        indicators.push('High rate of "quality" complaints (potential item switching)');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      if (topReason.reason === 'changed_mind' && topReason.count > pattern.orders.count * 0.5) {
        indicators.push('High rate of "changed mind" refunds (style cycling)');
        if (riskLevel !== 'critical') riskLevel = 'high';
      }
    }

    return { riskLevel, refundRate, indicators };
  }

  /**
   * Find users with suspicious behavior patterns
   * Used for batch analysis / dashboard
   */
  static async findSuspiciousUsers(limit: number = 100): Promise<any[]> {
    const anomalousUsers = await BehaviorPattern.findAnomalousUsers(50, limit);
    const highRefundUsers = await BehaviorPattern.findHighRefundRate(0.5, limit);

    // Combine and deduplicate
    const userMap = new Map();
    [...anomalousUsers, ...highRefundUsers].forEach((user) => {
      userMap.set(user._id.toString(), user);
    });

    return Array.from(userMap.values());
  }

  /**
   * Calculate pattern similarity between two users
   * Useful for detecting organized fraud rings
   */
  static async calculatePatternSimilarity(userId1: mongoose.Types.ObjectId, userId2: mongoose.Types.ObjectId): Promise<number> {
    const [pattern1, pattern2] = await Promise.all([
      BehaviorPattern.findOrCreateByUserId(userId1),
      BehaviorPattern.findOrCreateByUserId(userId2),
    ]);

    let similarity = 0;
    let comparisons = 0;

    // Compare order patterns
    if (pattern1.orders.avgValue && pattern2.orders.avgValue) {
      const avgDiff = Math.abs(pattern1.orders.avgValue - pattern2.orders.avgValue) / Math.max(pattern1.orders.avgValue, pattern2.orders.avgValue);
      similarity += 1 - Math.min(avgDiff, 1);
      comparisons++;
    }

    // Compare preferred countries
    const countries1 = pattern1.logins.preferredCountries || [];
    const countries2 = pattern2.logins.preferredCountries || [];
    const commonCountries = countries1.filter((c) => countries2.includes(c)).length;
    const totalCountries = new Set([...countries1, ...countries2]).size;
    if (totalCountries > 0) {
      similarity += commonCountries / totalCountries;
      comparisons++;
    }

    // Compare refund rates
    const refundDiff = Math.abs(pattern1.refunds.rate - pattern2.refunds.rate);
    similarity += 1 - refundDiff;
    comparisons++;

    // Calculate average similarity (0-1)
    const averageSimilarity = comparisons > 0 ? similarity / comparisons : 0;

    // Convert to percentage
    return Math.round(averageSimilarity * 100);
  }
}
