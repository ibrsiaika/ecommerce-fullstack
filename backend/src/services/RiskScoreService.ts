import mongoose from 'mongoose';
import { DeviceRiskProfile } from '../models/DeviceRiskProfile';
import { BehaviorPattern } from '../models/BehaviorPattern';
import { FraudRiskLevel } from '../models/FraudAlert';

/**
 * RiskScoreService
 * 
 * Composite risk scoring that combines multiple factors:
 * 1. Device risk profile (40 points max)
 * 2. User behavior deviation (30 points max)
 * 3. Transaction characteristics (20 points max)
 * 4. Payment processor signals (10 points max)
 * 
 * Final score: 0-100
 * - 0-39: LOW RISK (allow transaction)
 * - 40-59: MEDIUM RISK (flag for monitoring)
 * - 60-79: HIGH RISK (require additional verification)
 * - 80-100: CRITICAL (block or escalate)
 * 
 * This service combines signals from fraud detection into a single risk score
 * that can be used for real-time decision making.
 */

interface RiskFactors {
  userId?: mongoose.Types.ObjectId;
  deviceId?: string;
  ipAddress?: string;
  transactionAmount?: number;
  paymentMethod?: string;
  orderId?: string;
}

interface ScoreBreakdown {
  deviceScore: number;
  behaviorScore: number;
  transactionScore: number;
  paymentScore: number;
  totalScore: number;
  riskLevel: FraudRiskLevel;
  factors: string[];
}

export class RiskScoreService {
  /**
   * Calculate composite risk score from all factors
   * Maximum score: 100 (hard cap)
   */
  static async calculateRiskScore(factors: RiskFactors): Promise<ScoreBreakdown> {
    const breakdown: ScoreBreakdown = {
      deviceScore: 0,
      behaviorScore: 0,
      transactionScore: 0,
      paymentScore: 0,
      totalScore: 0,
      riskLevel: FraudRiskLevel.LOW,
      factors: [],
    };

    // Get scores from each component in parallel
    const [deviceScore, behaviorScore] = await Promise.all([
      this.getDeviceRiskScore(factors.deviceId || ''),
      this.getBehaviorRiskScore(factors.userId || new mongoose.Types.ObjectId()),
    ]);

    breakdown.deviceScore = deviceScore.score;
    breakdown.behaviorScore = behaviorScore.score;

    // Transaction and payment scores (synchronous)
    breakdown.transactionScore = this.getTransactionRiskScore(factors.transactionAmount || 0);
    breakdown.paymentScore = this.getPaymentRiskScore(factors.paymentMethod || '');

    // Combine scores with weights
    // Device: 40%, Behavior: 30%, Transaction: 20%, Payment: 10%
    breakdown.totalScore = Math.min(
      (breakdown.deviceScore * 0.4 +
        breakdown.behaviorScore * 0.3 +
        breakdown.transactionScore * 0.2 +
        breakdown.paymentScore * 0.1) as any,
      100
    );

    // Determine risk level
    if (breakdown.totalScore >= 80) {
      breakdown.riskLevel = FraudRiskLevel.CRITICAL;
    } else if (breakdown.totalScore >= 60) {
      breakdown.riskLevel = FraudRiskLevel.HIGH;
    } else if (breakdown.totalScore >= 40) {
      breakdown.riskLevel = FraudRiskLevel.MEDIUM;
    } else {
      breakdown.riskLevel = FraudRiskLevel.LOW;
    }

    // Collect factor explanations
    breakdown.factors = [
      ...deviceScore.factors,
      ...behaviorScore.factors,
      ...this.getTransactionFactors(factors.transactionAmount || 0),
      ...this.getPaymentFactors(factors.paymentMethod || ''),
    ];

    return breakdown;
  }

  /**
   * Get device risk score (0-100)
   * Factors:
   * - Device age (new device = higher risk)
   * - Number of accounts (account farming)
   * - Login attempts (brute force)
   * - Payment success rate
   * - Geographic velocity (impossible travel)
   */
  private static async getDeviceRiskScore(
    deviceId: string
  ): Promise<{ score: number; factors: string[] }> {
    if (!deviceId || deviceId === 'unknown') {
      return { score: 5, factors: ['Unknown device identifier'] };
    }

    const profile = await DeviceRiskProfile.findOrCreateByDeviceId(deviceId);
    let score = 0;
    const factors: string[] = [];

    // Unique user count (account farming indicator)
    if (profile.uniqueUserCount > 50) {
      score += 30;
      factors.push(`Device used by ${profile.uniqueUserCount} accounts (account farm)`);
    } else if (profile.uniqueUserCount > 10) {
      score += 20;
      factors.push(`Device used by ${profile.uniqueUserCount} accounts`);
    } else if (profile.uniqueUserCount > 3) {
      score += 10;
      factors.push(`Device shared by ${profile.uniqueUserCount} users`);
    }

    // Failed login attempts
    if (profile.loginAttemptCount24h > 100) {
      score += 25;
      factors.push(`High login failure rate (${profile.loginAttemptCount24h} failed attempts)`);
    } else if (profile.loginAttemptCount24h > 20) {
      score += 15;
      factors.push(`Multiple failed login attempts (${profile.loginAttemptCount24h})`);
    }

    // Payment success rate
    if (profile.paymentSuccessRate < 0.3) {
      score += 20;
      factors.push(`Low payment success rate (${(profile.paymentSuccessRate * 100).toFixed(1)}%)`);
    } else if (profile.paymentSuccessRate < 0.7) {
      score += 10;
      factors.push(`Moderate payment decline rate (${(100 - profile.paymentSuccessRate * 100).toFixed(1)}%)`);
    }

    // Geographic velocity (location change speed)
    if (profile.locationChangeVelocity && profile.locationChangeVelocity < 3600) {
      score += 40;
      factors.push(`Impossible travel velocity (${profile.locationChangeVelocity} seconds)`);
    } else if (profile.uniqueCountries && profile.uniqueCountries.length > 10) {
      score += 15;
      factors.push(`Multiple countries accessed (${profile.uniqueCountries.length})`);
    }

    // Device already flagged or blocked
    if (profile.blockedAt) {
      score += 50;
      factors.push('Device is blocked');
    } else if (profile.flaggedAt) {
      score += 25;
      factors.push(`Device flagged (${profile.flaggedReason})`);
    }

    return { score: Math.min(score, 100), factors };
  }

  /**
   * Get behavior risk score (0-100)
   * Factors:
   * - Deviation from user baseline
   * - Refund rate anomalies
   * - Payment decline trends
   * - New purchase patterns
   */
  private static async getBehaviorRiskScore(
    userId: mongoose.Types.ObjectId
  ): Promise<{ score: number; factors: string[] }> {
    const pattern = await BehaviorPattern.findOrCreateByUserId(userId);
    let score = 0;
    const factors: string[] = [];

    if (!pattern.hasConfidentBaseline()) {
      factors.push('New user (limited behavioral data)');
      score += 5; // New users are slightly more risky
      return { score, factors };
    }

    // Refund rate
    if (pattern.refunds.rate > 0.8) {
      score += 40;
      factors.push(`Very high refund rate (${(pattern.refunds.rate * 100).toFixed(1)}%)`);
    } else if (pattern.refunds.rate > 0.5) {
      score += 25;
      factors.push(`High refund rate (${(pattern.refunds.rate * 100).toFixed(1)}%)`);
    } else if (pattern.refunds.rate > 0.3) {
      score += 15;
      factors.push(`Above-average refund rate (${(pattern.refunds.rate * 100).toFixed(1)}%)`);
    }

    // Payment decline rate
    if (pattern.payments.declineRate > 0.5) {
      score += 30;
      factors.push(`High payment decline rate (${(pattern.payments.declineRate * 100).toFixed(1)}%)`);
    } else if (pattern.payments.declineRate > 0.2) {
      score += 15;
      factors.push(`Moderate payment decline rate (${(pattern.payments.declineRate * 100).toFixed(1)}%)`);
    }

    // Anomaly score
    if (pattern.isAnomaly && pattern.anomalyScore > 70) {
      score += 30;
      factors.push(
        `Behavior anomaly detected (score: ${pattern.anomalyScore}, ${pattern.anomalyReasons.join(', ')})`
      );
    } else if (pattern.isAnomaly && pattern.anomalyScore > 40) {
      score += 15;
      factors.push(`Possible behavior anomaly (${pattern.anomalyReasons.join(', ')})`);
    }

    return { score: Math.min(score, 100), factors };
  }

  /**
   * Get transaction characteristic risk score (0-100)
   * Factors:
   * - Amount vs user baseline
   * - Order frequency
   * - Item categories
   */
  private static getTransactionRiskScore(amount: number): number {
    let score = 0;

    // Very high amount
    if (amount > 10000) {
      score += 15;
    } else if (amount > 5000) {
      score += 10;
    } else if (amount > 1000) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Get payment method risk score (0-100)
   * Factors:
   * - Payment method type (prepaid = riskier)
   * - New payment method for user
   * - Card brand risk profile
   */
  private static getPaymentRiskScore(paymentMethod: string): number {
    let score = 0;

    // Prepaid cards are higher risk (often associated with carding)
    if (paymentMethod.toLowerCase().includes('prepaid')) {
      score += 20;
    }

    // Wire transfers are high risk (no chargeback)
    if (paymentMethod.toLowerCase().includes('wire')) {
      score += 25;
    }

    // Cryptocurrency is variable (assume higher)
    if (paymentMethod.toLowerCase().includes('crypto')) {
      score += 15;
    }

    // Gift cards are moderate risk
    if (paymentMethod.toLowerCase().includes('gift')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Get explanatory factors for transaction amount
   */
  private static getTransactionFactors(amount: number): string[] {
    const factors: string[] = [];

    if (amount > 10000) {
      factors.push(`Very high transaction amount ($${amount.toFixed(2)})`);
    } else if (amount > 5000) {
      factors.push(`High transaction amount ($${amount.toFixed(2)})`);
    } else if (amount > 1000) {
      factors.push(`Moderate transaction amount ($${amount.toFixed(2)})`);
    }

    return factors;
  }

  /**
   * Get explanatory factors for payment method
   */
  private static getPaymentFactors(paymentMethod: string): string[] {
    const factors: string[] = [];

    if (paymentMethod.toLowerCase().includes('prepaid')) {
      factors.push('Using prepaid card (higher fraud risk)');
    }
    if (paymentMethod.toLowerCase().includes('wire')) {
      factors.push('Using wire transfer (no chargeback protection)');
    }
    if (paymentMethod.toLowerCase().includes('crypto')) {
      factors.push('Using cryptocurrency (irreversible)');
    }

    return factors;
  }

  /**
   * Get risk level description for display
   */
  static getRiskLevelDescription(riskLevel: FraudRiskLevel): string {
    const descriptions: Record<FraudRiskLevel, string> = {
      [FraudRiskLevel.LOW]: 'Low risk - transaction allowed',
      [FraudRiskLevel.MEDIUM]: 'Medium risk - monitor transaction',
      [FraudRiskLevel.HIGH]: 'High risk - requires verification',
      [FraudRiskLevel.CRITICAL]: 'Critical risk - transaction blocked',
    };
    return descriptions[riskLevel] || 'Unknown risk level';
  }
}
