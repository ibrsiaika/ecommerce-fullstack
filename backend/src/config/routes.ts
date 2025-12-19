import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

// Routes
import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import productRoutes from '../routes/products';
import orderRoutes from '../routes/orders';
import uploadRoutes from '../routes/upload';
import adminRoutes from '../routes/admin';
import sellerRoutes from '../routes/seller';
import customizationRoutes from '../routes/customization';
import roleRoutes from '../routes/roles';

// Middleware
import { errorHandler } from '../middleware/errorHandler';
import { notFound } from '../middleware/notFound';

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
  // Specific admin routes must come BEFORE generic /api/admin route
  { path: '/api/admin/customization', router: customizationRoutes },
  { path: '/api/admin/roles', router: roleRoutes },
  { path: '/api/admin', router: adminRoutes },
  { path: '/api/seller', router: sellerRoutes },
];

/**
 * Register all routes and API documentation
 */
export const registerRoutes = (app: Express, swaggerSpec: any) => {
  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
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
