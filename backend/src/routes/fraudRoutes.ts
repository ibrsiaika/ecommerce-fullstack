import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth';
// import { auditLog } from '../middleware/auditLog'; // TODO: Create middleware or use AuditLogService directly
import { FraudAlert, FraudAlertStatus } from '../models/FraudAlert';
import { DeviceRiskProfile, DeviceRiskLevel } from '../models/DeviceRiskProfile';
import { BehaviorPattern } from '../models/BehaviorPattern';
import { FraudDetectionService } from '../services/FraudDetectionService';
import { RiskScoreService } from '../services/RiskScoreService';
import { BehaviorAnalysisService } from '../services/BehaviorAnalysisService';
import { AuditLogService } from '../services/AuditLogService';
import { AuditActionType, ResourceType } from '../models/AuditLog';

const router = Router();

/**
 * Fraud Detection Routes
 * 
 * All endpoints require authentication + ADMIN role
 * Used by fraud analysts and compliance team
 */

// Middleware: Require fraud analyst role
const requireFraudAnalyst = authorize('admin', 'fraud_analyst');

/**
 * GET /api/admin/fraud/alerts
 * Get pending fraud alerts for analyst review
 * 
 * Query params:
 * - status: pending|approved|blocked|investigating (default: pending)
 * - riskLevel: low|medium|high|critical (filter)
 * - limit: 1-100 (default: 50)
 * - skip: 0+ (default: 0)
 */
router.get('/alerts', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string) || 'pending';
    const riskLevel = (req.query.riskLevel as string) || undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = parseInt(req.query.skip as string) || 0;

    const query: any = {};

    if (status) {
      query.status = status;
    }
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    const alerts = await FraudAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'email firstName lastName');

    const total = await FraudAlert.countDocuments(query);

    // Log view action
    await AuditLogService.log(
      AuditActionType.VIEWED,
      ResourceType.FRAUD_ALERT,
      null as any,
      req.user?.id || new mongoose.Types.ObjectId(),
      req,
      undefined
    );

    res.json({
      alerts,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching fraud alerts:', error);
    res.status(500).json({ error: 'Failed to fetch fraud alerts' });
  }
});

/**
 * GET /api/admin/fraud/alerts/:id
 * Get detailed fraud alert with full investigation history
 */
router.get('/alerts/:id', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await FraudAlert.findById(req.params.id).populate([
      { path: 'userId', select: 'email name phone createdAt' },
      { path: 'investigation.analystId', select: 'email name role' },
    ]);

    if (!alert) {
      res.status(404).json({ error: 'Fraud alert not found' });
      return;
    }

    // Log view action
    await AuditLogService.log(
      AuditActionType.VIEWED,
      ResourceType.FRAUD_ALERT,
      alert._id.toString(),
      String(req.user?.id || ''),
      req
    );

    res.json(alert);
  } catch (error) {
    console.error('Error fetching fraud alert:', error);
    res.status(500).json({ error: 'Failed to fetch fraud alert' });
  }
});

/**
 * POST /api/admin/fraud/alerts/:id/approve
 * Analyst approves the fraud detection (no fraud found)
 */
router.post('/alerts/:id/approve', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Fraud alert not found' });
      return;
    }

    // Approve the alert
    await alert.approve(req.user?.id || new mongoose.Types.ObjectId(), reason);

    // Log approval action
    await AuditLogService.log(
      AuditActionType.APPROVED,
      ResourceType.FRAUD_ALERT,
      alert._id.toString(),
      String(req.user?.id || ''),
      req,
      undefined
    );

    res.json({ message: 'Fraud alert approved', alert });
  } catch (error) {
    console.error('Error approving fraud alert:', error);
    res.status(500).json({ error: 'Failed to approve fraud alert' });
  }
});

/**
 * POST /api/admin/fraud/alerts/:id/block
 * Analyst blocks the user/transaction (fraud confirmed)
 */
router.post('/alerts/:id/block', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Fraud alert not found' });
      return;
    }

    const analystId = req.user?.id || new mongoose.Types.ObjectId();

    // Block the alert and suspend user using FraudDetectionService
    // This handles: suspending account, invalidating sessions, and sending notification
    await FraudDetectionService.blockAlert(alert._id, analystId, reason);

    // Log block action
    await AuditLogService.log(
      AuditActionType.BLOCKED,
      ResourceType.FRAUD_ALERT,
      alert._id.toString(),
      String(analystId),
      req,
      undefined
    );

    res.json({ message: 'Fraud alert blocked - user suspended', alert });
  } catch (error) {
    console.error('Error blocking fraud alert:', error);
    res.status(500).json({ error: 'Failed to block fraud alert' });
  }
});

/**
 * POST /api/admin/fraud/alerts/:id/escalate
 * Escalate to law enforcement or payment processor
 */
router.post('/alerts/:id/escalate', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const { escalateTo, reason } = req.body;

    if (!escalateTo || !['law_enforcement', 'payment_processor', 'chargeback_team'].includes(escalateTo)) {
      res.status(400).json({ error: 'Invalid escalation target' });
      return;
    }

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Fraud alert not found' });
      return;
    }

    // Escalate the alert
    await alert.escalate(escalateTo, reason);

    // Log escalation action
    await AuditLogService.log(
      AuditActionType.ESCALATED,
      ResourceType.FRAUD_ALERT,
      alert._id.toString(),
      String(req.user?.id || ''),
      req,
      { escalation: { from: null, to: { escalateTo, reason, userId: String(alert.userId) } } }
    );

    res.json({ message: `Fraud alert escalated to ${escalateTo}`, alert });
  } catch (error) {
    console.error('Error escalating fraud alert:', error);
    res.status(500).json({ error: 'Failed to escalate fraud alert' });
  }
});

/**
 * GET /api/admin/fraud/devices
 * Dashboard: Risky devices for monitoring
 * 
 * Shows devices with:
 * - Multiple accounts (account farming)
 * - High payment failure rate
 * - Impossible travel patterns
 * - Already blocked
 */
router.get('/devices', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const riskLevel = (req.query.riskLevel as string) || undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // Cast riskLevel to the proper enum type if provided
    const riskLevelEnum = riskLevel as DeviceRiskLevel | undefined;

    // Get risky devices
    const riskyDevices = await DeviceRiskProfile.findRiskyDevices(riskLevelEnum, limit);

    // Get account farm devices
    const accountFarms = await DeviceRiskProfile.findAccountFarms(5, limit);

    // Get impossible travel devices
    const impossibleTravel = await DeviceRiskProfile.findImpossibleTravel(3600, limit); // 1 hour

    // Log view action
    await AuditLogService.log(
      AuditActionType.VIEWED,
      ResourceType.DEVICE,
      'dashboard',
      String(req.user?.id || ''),
      req,
      { deviceStats: { from: null, to: { riskyCount: riskyDevices.length, farmCount: accountFarms.length, travelCount: impossibleTravel.length } } }
    );

    res.json({
      riskyDevices,
      accountFarms,
      impossibleTravel,
    });
  } catch (error) {
    console.error('Error fetching risky devices:', error);
    res.status(500).json({ error: 'Failed to fetch risky devices' });
  }
});

/**
 * GET /api/admin/fraud/users
 * Dashboard: Users with anomalous behavior patterns
 * 
 * Shows users with:
 * - High refund rates (>50%)
 * - Unusual purchase patterns
 * - Payment decline rates
 */
router.get('/users', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // Get anomalous users
    const anomalousUsers = await BehaviorPattern.findAnomalousUsers(50, limit);

    // Get high refund rate users
    const highRefundUsers = await BehaviorPattern.findHighRefundRate(0.5, limit);

    // Log view action
    await AuditLogService.log(
      AuditActionType.VIEWED,
      ResourceType.USER,
      'dashboard',
      String(req.user?.id || ''),
      req,
      { userStats: { from: null, to: { anomalousCount: anomalousUsers.length, refundCount: highRefundUsers.length } } }
    );

    res.json({
      anomalousUsers,
      highRefundUsers,
    });
  } catch (error) {
    console.error('Error fetching suspicious users:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious users' });
  }
});

/**
 * GET /api/admin/fraud/users/:userId/behavior
 * Get user's behavior patterns and baseline
 */
router.get('/users/:userId/behavior', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const patterns = await BehaviorAnalysisService.getBaselinePatterns(userId);
    const anomalies = await BehaviorAnalysisService.detectAnomalies(userId);

    // Log view action
    await AuditLogService.log(
      AuditActionType.VIEWED,
      ResourceType.USER,
      String(userId),
      String(req.user?.id || ''),
      req,
      { behavior: { from: null, to: { hasBaseline: patterns.hasConfidentBaseline } } }
    );

    res.json({
      patterns,
      anomalies,
    });
  } catch (error) {
    console.error('Error fetching user behavior:', error);
    res.status(500).json({ error: 'Failed to fetch user behavior' });
  }
});

/**
 * POST /api/admin/fraud/detect
 * Manually trigger fraud detection for a transaction
 * 
 * Used for testing or manual review
 */
router.post('/detect', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, ipAddress, deviceId, contextType, contextData } = req.body;

    if (!userId || !contextType) {
      res.status(400).json({ error: 'userId and contextType are required' });
      return;
    }

    const result = await FraudDetectionService.detectFraud({
      userId: new mongoose.Types.ObjectId(userId),
      email: email || 'unknown@example.com',
      ipAddress: ipAddress || '0.0.0.0',
      deviceId: deviceId || 'unknown',
      contextType: contextType as 'order' | 'payment' | 'account' | 'refund' | 'login',
      contextData: contextData || {},
      req,
    });

    // Log detection request
    await AuditLogService.log(
      AuditActionType.FRAUD_ALERT,
      ResourceType.USER,
      userId,
      String(req.user?.id || ''),
      req,
      { detection: { from: null, to: { riskScore: result.riskScore, riskLevel: result.riskLevel } } }
    );

    res.json(result);
  } catch (error) {
    console.error('Error detecting fraud:', error);
    res.status(500).json({ error: 'Failed to detect fraud' });
  }
});

/**
 * GET /api/admin/fraud/risk-score/:userId
 * Calculate current risk score for a user
 */
router.get('/risk-score/:userId', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const { transactionAmount, paymentMethod, deviceId } = req.query;

    const breakdown = await RiskScoreService.calculateRiskScore({
      userId,
      deviceId: (deviceId as string) || undefined,
      transactionAmount: transactionAmount ? parseFloat(transactionAmount as string) : undefined,
      paymentMethod: (paymentMethod as string) || undefined,
    });

    res.json(breakdown);
  } catch (error) {
    console.error('Error calculating risk score:', error);
    res.status(500).json({ error: 'Failed to calculate risk score' });
  }
});

/**
 * GET /api/admin/fraud/device/:deviceId
 * Get device risk profile details
 */
router.get('/device/:deviceId', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const device = await DeviceRiskProfile.findOrCreateByDeviceId(req.params.deviceId);

    // Log view action
    await AuditLogService.log(
      AuditActionType.VIEWED,
      ResourceType.DEVICE,
      req.params.deviceId,
      String(req.user?.id || ''),
      req,
      { device: { from: null, to: { deviceId: req.params.deviceId, riskScore: device.riskScore } } }
    );

    res.json(device);
  } catch (error) {
    console.error('Error fetching device profile:', error);
    res.status(500).json({ error: 'Failed to fetch device profile' });
  }
});

/**
 * POST /api/admin/fraud/device/:deviceId/flag
 * Manually flag a device for monitoring
 */
router.post('/device/:deviceId/flag', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    const device = await DeviceRiskProfile.findOrCreateByDeviceId(req.params.deviceId);
    await device.flag(reason);

    // Log flag action
    await AuditLogService.log(
      AuditActionType.FLAGGED,
      ResourceType.DEVICE,
      req.params.deviceId,
      String(req.user?.id || ''),
      req,
      { flagged: { from: null, to: { deviceId: req.params.deviceId, reason } } }
    );

    res.json({ message: 'Device flagged', device });
  } catch (error) {
    console.error('Error flagging device:', error);
    res.status(500).json({ error: 'Failed to flag device' });
  }
});

/**
 * POST /api/admin/fraud/device/:deviceId/block
 * Manually block a device from use
 */
router.post('/device/:deviceId/block', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    const device = await DeviceRiskProfile.findOrCreateByDeviceId(req.params.deviceId);
    await device.block(reason);

    // Log block action
    await AuditLogService.log(
      AuditActionType.BLOCKED,
      ResourceType.DEVICE,
      req.params.deviceId,
      String(req.user?.id || ''),
      req,
      { blocked: { from: null, to: { deviceId: req.params.deviceId, reason } } }
    );

    res.json({ message: 'Device blocked', device });
  } catch (error) {
    console.error('Error blocking device:', error);
    res.status(500).json({ error: 'Failed to block device' });
  }
});

/**
 * POST /api/admin/fraud/device/:deviceId/unblock
 * Unblock a previously blocked device
 */
router.post('/device/:deviceId/unblock', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const device = await DeviceRiskProfile.findOrCreateByDeviceId(req.params.deviceId);
    await device.unblock();

    // Log unblock action
    await AuditLogService.log(
      AuditActionType.UNBLOCKED,
      ResourceType.DEVICE,
      req.params.deviceId,
      String(req.user?.id || ''),
      req,
      { unblocked: { from: null, to: { deviceId: req.params.deviceId } } }
    );

    res.json({ message: 'Device unblocked', device });
  } catch (error) {
    console.error('Error unblocking device:', error);
    res.status(500).json({ error: 'Failed to unblock device' });
  }
});

/**
 * GET /api/admin/fraud/stats
 * Dashboard statistics for fraud monitoring
 */
router.get('/stats', authenticate, requireFraudAnalyst, async (req: Request, res: Response): Promise<void> => {
  try {
    const [pendingAlerts, totalAlerts, blockedDevices, highRiskUsers, suspiciousUsers] = await Promise.all([
      FraudAlert.countDocuments({ status: 'investigating' }),
      FraudAlert.countDocuments({}),
      DeviceRiskProfile.countDocuments({ blockedAt: { $exists: true, $ne: null } }),
      DeviceRiskProfile.countDocuments({ riskScore: { $gte: 80 } }),
      BehaviorPattern.countDocuments({ isAnomaly: true, anomalyScore: { $gte: 50 } }),
    ]);

    res.json({
      pendingAlerts,
      totalAlerts,
      blockedDevices,
      highRiskUsers,
      suspiciousUsers,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching fraud stats:', error);
    res.status(500).json({ error: 'Failed to fetch fraud stats' });
  }
});

export default router;
