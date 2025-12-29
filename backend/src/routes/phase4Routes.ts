import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { protect as authenticate } from '../middleware/auth';
import Joi from 'joi';
import { StripeService } from '../services/StripeService';
import { PayPalService } from '../services/PayPalService';
import { NotificationService } from '../services/NotificationService';
import { GeoIntelligenceService } from '../services/GeoIntelligenceService';
import { AuditLogService } from '../services/AuditLogService';
import { FraudDetectionService } from '../services/FraudDetectionService';
import { Transaction } from '../models/Transaction';
import { NotificationType, NotificationChannel } from '../models/Notification';
import { AuditActionType, ResourceType } from '../models/AuditLog';

// Rate limiter for webhook endpoints (stricter than default)
const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many webhook requests' }
});

// Simple validation middleware
const validate = (schema: { body?: Joi.ObjectSchema; headers?: Joi.ObjectSchema }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
    }
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers, { allowUnknown: true });
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
    }
    next();
  };
};

const router = Router();

/**
 * PAYMENT ROUTES
 */

/**
 * POST /api/phase4/payments/charge
 * Process a payment with fraud detection and geographic analysis
 */
router.post(
  '/payments/charge',
  authenticate,
  validate({
    body: Joi.object({
      orderId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      currency: Joi.string().default('USD'),
      paymentMethodId: Joi.string().required(),
      processor: Joi.string().valid('stripe', 'paypal').required(),
      ipAddress: Joi.string().ip().required(),
      userAgent: Joi.string(),
      billingAddress: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        postalCode: Joi.string(),
        country: Joi.string(),
      }),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, amount, currency, paymentMethodId, processor, ipAddress, billingAddress } = req.body;
      const userId = req.user!.id;

      // Step 1: Perform geographic intelligence analysis
      const countryCode = billingAddress?.country || 'US';
      const geoRisk = await GeoIntelligenceService.assessGeoRisk(ipAddress, countryCode);

      // Step 2: Perform fraud detection using the detectFraud method
      const fraudAnalysis = await FraudDetectionService.detectFraud({
        userId: new mongoose.Types.ObjectId(userId),
        email: req.user!.email || 'unknown@example.com',
        ipAddress,
        deviceId: req.headers['x-device-id'] as string || 'unknown',
        contextType: 'payment',
        contextData: {
          orderId,
          amount,
          currency,
          countryCode,
          paymentMethodId,
          geoRiskScore: geoRisk.geoRiskScore,
          impossibleTravel: geoRisk.impossibleTravel,
          vpnDetected: geoRisk.vpnDetected,
        },
        req,
      });

      // Step 3: Check geographic restrictions
      const shippingCheck = GeoIntelligenceService.canAcceptPayment(countryCode, amount);
      if (!shippingCheck.canAccept) {
        await AuditLogService.log(
          AuditActionType.VIEWED,
          ResourceType.ORDER,
          orderId,
          userId,
          req,
          { geoRestriction: { from: null, to: { countryCode, amount, reason: shippingCheck.reason } } }
        );

        return res.status(400).json({
          success: false,
          error: shippingCheck.reason,
          code: 'GEO_RESTRICTION',
        });
      }

      // Step 4: Process payment based on processor
      let transaction: any;

      if (processor === 'stripe') {
        transaction = await StripeService.charge({
          orderId: new mongoose.Types.ObjectId(orderId),
          userId: new mongoose.Types.ObjectId(userId),
          paymentMethodId: new mongoose.Types.ObjectId(paymentMethodId),
          amount,
          currency,
          description: `Payment for order ${orderId}`,
          idempotencyKey: `${orderId}-${Date.now()}`,
          fraudScore: fraudAnalysis.riskScore,
          metadata: {
            geoRiskScore: String(geoRisk.geoRiskScore),
            fraudScore: String(fraudAnalysis.riskScore),
            ipAddress,
            countryCode,
          },
        });
      } else if (processor === 'paypal') {
        transaction = await PayPalService.charge({
          orderId: new mongoose.Types.ObjectId(orderId),
          userId: new mongoose.Types.ObjectId(userId),
          paymentMethodId: new mongoose.Types.ObjectId(paymentMethodId),
          amount,
          currency,
          description: `Payment for order ${orderId}`,
          idempotencyKey: `${orderId}-${Date.now()}`,
          fraudScore: fraudAnalysis.riskScore,
        });
      }

      // Step 5: Send payment confirmation notification
      await NotificationService.createAndSend({
        userId: new mongoose.Types.ObjectId(userId),
        type: NotificationType.ORDER_STATUS,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        title: `Payment Confirmed - Order ${orderId}`,
        body: `Your payment of ${amount} ${currency} has been processed successfully.`,
        templateId: 'payment_success',
        variables: {
          orderId,
          amount: `${amount}`,
          currency,
          processor,
        },
      });

      // Step 6: Log successful payment
      await AuditLogService.log(
        AuditActionType.PAYMENT_PROCESSED,
        ResourceType.TRANSACTION,
        transaction?._id?.toString() || orderId,
        userId,
        req,
        {
          payment: {
            from: null,
            to: {
              orderId,
              amount,
              processor,
              geoRiskScore: geoRisk.geoRiskScore,
              fraudScore: fraudAnalysis.riskScore,
            }
          }
        }
      );

      res.json({
        success: true,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          processorId: transaction.processor?.transactionId,
        },
        geoAnalysis: {
          countryRisk: geoRisk.countryRisk.riskScore,
          geoRiskScore: geoRisk.geoRiskScore,
          vpnDetected: geoRisk.vpnDetected,
          impossibleTravel: geoRisk.impossibleTravel,
        },
        fraudAnalysis: {
          fraudScore: fraudAnalysis.riskScore,
          riskLevel: fraudAnalysis.riskLevel,
          signals: fraudAnalysis.signals,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/phase4/payments/refund
 * Process a refund for a transaction
 */
router.post(
  '/payments/refund',
  authenticate,
  validate({
    body: Joi.object({
      transactionId: Joi.string().required(),
      amount: Joi.number().positive(),
      reason: Joi.string().required(),
      processor: Joi.string().valid('stripe', 'paypal').required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transactionId, amount, reason, processor } = req.body;
      const userId = req.user!.id;

      // Get original transaction
      const originalTransaction = await Transaction.findById(transactionId);
      if (!originalTransaction) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }

      // Verify ownership
      if (originalTransaction.user.toString() !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      // Process refund
      let refundTransaction: any;

      if (processor === 'stripe') {
        refundTransaction = await StripeService.refund({
          transactionId: new mongoose.Types.ObjectId(transactionId),
          amount: amount || originalTransaction.amount,
          reason,
        });
      } else if (processor === 'paypal') {
        refundTransaction = await PayPalService.refund({
          transactionId: new mongoose.Types.ObjectId(transactionId),
          amount: amount || originalTransaction.amount,
          reason,
        });
      }

      // Send refund notification
      await NotificationService.createAndSend({
        userId: new mongoose.Types.ObjectId(userId),
        type: NotificationType.REFUND_ISSUED,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        title: 'Refund Processed',
        body: `A refund of ${refundTransaction?.amount || amount} has been initiated. It may take 3-5 business days to appear in your account.`,
        templateId: 'refund_notification',
        variables: {
          amount: `${refundTransaction?.amount || amount}`,
          reason,
          estimatedDays: '3-5',
        },
      });

      // Log refund
      await AuditLogService.log(
        AuditActionType.REFUND_APPROVED,
        ResourceType.TRANSACTION,
        transactionId,
        userId,
        req,
        { refund: { from: null, to: { amount: refundTransaction?.amount || amount, reason } } }
      );

      res.json({
        success: true,
        refund: {
          id: refundTransaction._id,
          originalTransactionId: transactionId,
          amount: refundTransaction.amount,
          status: refundTransaction.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/phase4/payments/webhook/stripe
 * Stripe webhook handler
 */
router.post(
  '/payments/webhook/stripe',
  webhookRateLimiter,
  validate({
    headers: Joi.object({
      'stripe-signature': Joi.string().required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await StripeService.processWebhook(req.body, signature);

      // Log webhook - StripeService.processWebhook returns void
      await AuditLogService.log(
        AuditActionType.VIEWED,
        ResourceType.TRANSACTION,
        'stripe-webhook',
        null,
        req,
        { webhook: { from: null, to: { type: 'stripe_webhook_processed' } } }
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/phase4/payments/webhook/paypal
 * PayPal webhook handler
 */
router.post(
  '/payments/webhook/paypal',
  webhookRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // PayPal webhook signature verification requires specific headers
      const webhookId = process.env.PAYPAL_WEBHOOK_ID || '';
      const transmissionId = req.headers['paypal-transmission-id'] as string || '';
      const transmissionTime = req.headers['paypal-transmission-time'] as string || '';
      const certUrl = req.headers['paypal-cert-url'] as string || '';
      const authAlgo = req.headers['paypal-auth-algo'] as string || '';
      const transmissionSig = req.headers['paypal-transmission-sig'] as string || '';

      const isValid = await PayPalService.verifyWebhookSignature(
        webhookId,
        transmissionId,
        transmissionTime,
        certUrl,
        authAlgo,
        transmissionSig,
        JSON.stringify(req.body)
      );

      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
      }

      await PayPalService.processWebhook(req.body);

      // Log webhook
      await AuditLogService.log(
        AuditActionType.VIEWED,
        ResourceType.TRANSACTION,
        req.body.id || 'paypal-webhook',
        null,
        req,
        { webhook: { from: null, to: { type: req.body.event_type } } }
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * NOTIFICATION ROUTES
 */

/**
 * POST /api/phase4/notifications/send
 * Manually send a notification
 */
router.post(
  '/notifications/send',
  authenticate,
  validate({
    body: Joi.object({
      userId: Joi.string().required(),
      type: Joi.string().valid(...Object.values(NotificationType)).required(),
      channels: Joi.array().items(Joi.string().valid(...Object.values(NotificationChannel))),
      title: Joi.string().required(),
      body: Joi.string().required(),
      actionUrl: Joi.string().uri(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, type, channels, title, body, actionUrl } = req.body;

      // Map string channels to NotificationChannel enums
      const channelEnums = (channels || [NotificationChannel.EMAIL]).map((ch: string) => {
        return ch as NotificationChannel;
      });

      const notifications = await NotificationService.createAndSend({
        userId: new mongoose.Types.ObjectId(userId),
        type: type as NotificationType,
        channels: channelEnums,
        title,
        body,
        actionUrl,
      });

      res.json({
        success: true,
        notifications: notifications.map((n: any) => ({
          id: n._id,
          channel: n.channel,
          status: n.status,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/phase4/notifications
 * Get user's notifications
 */
router.get(
  '/notifications',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;

      const notifications = await NotificationService.getUserNotifications(new mongoose.Types.ObjectId(userId), limit);
      const unreadCount = await NotificationService.getUnreadCount(new mongoose.Types.ObjectId(userId));

      res.json({
        success: true,
        notifications: notifications.map((n: any) => ({
          id: n._id,
          type: n.type,
          channel: n.channel,
          title: n.title,
          body: n.body,
          status: n.status,
          readAt: n.readAt,
          createdAt: n.createdAt,
        })),
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/phase4/notifications/:id/read
 * Mark notification as read
 */
router.put(
  '/notifications/:id/read',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await NotificationService.markAsRead(new mongoose.Types.ObjectId(id), new mongoose.Types.ObjectId(userId));

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GEOGRAPHIC INTELLIGENCE ROUTES
 */

/**
 * POST /api/phase4/geo/assess-risk
 * Assess geographic risk for IP address
 */
router.post(
  '/geo/assess-risk',
  authenticate,
  validate({
    body: Joi.object({
      ipAddress: Joi.string().ip().required(),
      countryCode: Joi.string().length(2).required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ipAddress, countryCode } = req.body;

      const assessment = await GeoIntelligenceService.assessGeoRisk(ipAddress, countryCode);

      res.json({
        success: true,
        assessment: {
          geoRiskScore: assessment.geoRiskScore,
          countryRisk: assessment.countryRisk,
          vpnDetected: assessment.vpnDetected,
          impossibleTravel: assessment.impossibleTravel,
          reasons: assessment.reasons,
          location: {
            country: assessment.location.country,
            city: assessment.location.city,
            timezone: assessment.location.timezone,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/phase4/geo/check-shipping
 * Check shipping restrictions for country
 */
router.post(
  '/geo/check-shipping',
  validate({
    body: Joi.object({
      countryCode: Joi.string().length(2).required(),
      amount: Joi.number().positive(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { countryCode, amount } = req.body;

      const result = GeoIntelligenceService.canAcceptPayment(countryCode, amount);
      const restrictions = GeoIntelligenceService.getShippingRestrictions(countryCode);

      res.json({
        success: true,
        canAccept: result.canAccept,
        reason: result.reason,
        restrictions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/phase4/geo/detect-impossible-travel
 * Check for impossible travel between two locations
 */
router.post(
  '/geo/detect-impossible-travel',
  validate({
    body: Joi.object({
      location1: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      }).required(),
      location2: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      }).required(),
      timeDeltaSeconds: Joi.number().positive().required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { location1, location2, timeDeltaSeconds } = req.body;

      const result = await GeoIntelligenceService.detectImpossibleTravel(
        location1 as any,
        location2 as any,
        timeDeltaSeconds
      );

      res.json({
        success: true,
        isImpossible: result.isImpossible,
        distance: result.distance,
        requiredTimeSeconds: result.requiredTimeSeconds,
        actualTimeSeconds: result.actualTimeSeconds,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
