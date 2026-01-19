import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import mongoose from 'mongoose';

// Routes
import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import productRoutes from '../routes/products';
import orderRoutes from '../routes/orders';
import uploadRoutes from '../routes/upload';
import adminRoutes from '../routes/admin';
import sellerRoutes from '../routes/seller';
import configRoutes from '../routes/config';
import approvalRoutes from '../routes/approvalRoutes';
import auditRoutes from '../routes/auditRoutes';
import couponRoutes from '../routes/coupons';
import returnRoutes from '../routes/returns';
import reservationRoutes from '../routes/reservations';

// Middleware
import { errorHandler, notFound } from '../middleware/errorHandler';

/**
 * Route configuration
 */
interface RouteConfig {
  path: string;
  router: any;
}

const routes: RouteConfig[] = [
  { path: '/api/auth', router: authRoutes },
  { path: '/api/users', router: userRoutes },
  { path: '/api/products', router: productRoutes },
  { path: '/api/orders', router: orderRoutes },
  { path: '/api/upload', router: uploadRoutes },
  { path: '/api/config', router: configRoutes },
  { path: '/api/admin', router: adminRoutes },
  { path: '/api/seller', router: sellerRoutes },
  { path: '/api/admin/approvals', router: approvalRoutes },
  { path: '/api/audit', router: auditRoutes },
  { path: '/api/coupons', router: couponRoutes },
  { path: '/api/returns', router: returnRoutes },
  { path: '/api/reservations', router: reservationRoutes },
];

/**
 * Register all routes and API documentation
 */
export const registerRoutes = (app: Express, swaggerSpec: any) => {
  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check (liveness — process is up)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Readiness check — DB must be reachable before taking traffic
  app.get('/ready', async (req, res) => {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        res.status(503).json({ status: 'not_ready' });
        return;
      }
      await db.admin().ping();
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not_ready' });
    }
  });

  // Register all routes
  routes.forEach(({ path, router }) => {
    app.use(path, router);
  });

  // Static files for uploads
  app.use('/uploads', express.static('uploads'));

  // Error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);
};
