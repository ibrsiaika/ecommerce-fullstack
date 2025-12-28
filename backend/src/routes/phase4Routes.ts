import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { StripeService } from '../services/StripeService';
import { PayPalService } from '../services/PayPalService';
import { NotificationService } from '../services/NotificationService';
import { GeoIntelligenceService } from '../services/GeoIntelligenceService';
import { AuditLogService } from '../services/AuditLogService';
import { FraudDetectionService } from '../services/FraudDetectionService';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import Joi from 'joi';

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

      // Step 2: Perform fraud detection
      const fraudAnalysis = await FraudDetectionService.analyzeTransaction({
        userId,
        orderId,
        amount,
        currency,
        ipAddress,
        countryCode,
        paymentMethodId,
        geoRiskScore: geoRisk.geoRiskScore,
        impossibleTravel: geoRisk.impossibleTravel,
        vpnDetected: geoRisk.vpnDetected,
      });

      // Step 3: Check geographic restrictions
      const shippingCheck = GeoIntelligenceService.canAcceptPayment(countryCode, amount);
      if (!shippingCheck.canAccept) {
        await AuditLogService.log({
          userId,
          action: 'PAYMENT_REJECTED_GEO',
          resource: `payment:${orderId}`,
          reason: shippingCheck.reason,
          details: { countryCode, amount },
        });

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
          orderId,
          userId,
          paymentMethodId,
          amount,
          currency,
          idempotencyKey: `${orderId}-${Date.now()}`,
          metadata: {
            geoRiskScore: geoRisk.geoRiskScore,
            fraudScore: fraudAnalysis.fraudScore,
            ipAddress,
            countryCode,
          },
        });
      } else if (processor === 'paypal') {
        transaction = await PayPalService.charge({
          orderId,
          userId,
          paymentMethodId,
          amount,
          currency,
          metadata: {
            geoRiskScore: geoRisk.geoRiskScore,
            fraudScore: fraudAnalysis.fraudScore,
            ipAddress,
            countryCode,
          },
        });
      }

      // Step 5: Send payment confirmation notification
      await NotificationService.createAndSend({
        userId,
        type: 'payment_succeeded',
        channels: ['email', 'in_app'],
        subject: `Payment Confirmed - Order ${orderId}`,
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
      await AuditLogService.log({
        userId,
        action: 'PAYMENT_PROCESSED',
        resource: `payment:${transaction._id}`,
        details: {
          orderId,
          amount,
          processor,
          geoRiskScore: geoRisk.geoRiskScore,
          fraudScore: fraudAnalysis.fraudScore,
        },
      });

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
          fraudScore: fraudAnalysis.fraudScore,
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
          originalTransactionId: transactionId,
          amount: amount || originalTransaction.amount,
          reason,
        });
      } else if (processor === 'paypal') {
        refundTransaction = await PayPalService.refund({
          originalTransactionId: transactionId,
          amount: amount || originalTransaction.amount,
          reason,
        });
      }

      // Send refund notification
      await NotificationService.createAndSend({
        userId,
        type: 'refund_issued',
        channels: ['email', 'in_app'],
        subject: 'Refund Processed',
        body: `A refund of ${refundTransaction.amount} has been initiated. It may take 3-5 business days to appear in your account.`,
        templateId: 'refund_notification',
        variables: {
          amount: `${refundTransaction.amount}`,
          reason,
          estimatedDays: '3-5',
        },
      });

      // Log refund
      await AuditLogService.log({
        userId,
        action: 'PAYMENT_REFUNDED',
        resource: `transaction:${transactionId}`,
        details: { amount: refundTransaction.amount, reason },
      });

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
  validate({
    headers: Joi.object({
      'stripe-signature': Joi.string().required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = await StripeService.processWebhook(req.body, signature);

      // Log webhook
      await AuditLogService.log({
        userId: 'system',
        action: 'STRIPE_WEBHOOK_PROCESSED',
        resource: `webhook:${event.id}`,
        details: { type: event.type },
      });

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isValid = await PayPalService.verifyWebhookSignature(req.body, req.headers);

      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
      }

      const event = await PayPalService.processWebhook(req.body);

      // Log webhook
      await AuditLogService.log({
        userId: 'system',
        action: 'PAYPAL_WEBHOOK_PROCESSED',
        resource: `webhook:${req.body.id}`,
        details: { type: req.body.event_type },
      });

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
      type: Joi.string().required(),
      channels: Joi.array().items(Joi.string()),
      subject: Joi.string(),
      body: Joi.string().required(),
      actionUrl: Joi.string().uri(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, type, channels, subject, body, actionUrl } = req.body;

      const notifications = await NotificationService.createAndSend({
        userId,
        type,
        channels,
        subject,
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

      const notifications = await NotificationService.getUserNotifications(userId, limit);
      const unreadCount = await NotificationService.getUnreadCount(userId);

      res.json({
        success: true,
        notifications: notifications.map((n: any) => ({
          id: n._id,
          type: n.type,
          channel: n.channel,
          subject: n.subject,
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

      await NotificationService.markAsRead(id, userId);

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
