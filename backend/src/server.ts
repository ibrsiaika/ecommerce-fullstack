import express from 'express';
import dotenv from 'dotenv';

// Configuration imports
import {
  securityMiddleware,
  rateLimiter,
  corsConfig,
  bodyParserMiddleware,
  staticFilesConfig
} from './config/middleware';
import { swaggerConfig } from './config/swagger';
import { registerRoutes } from './config/routes';
import { connectDatabase, setupGracefulShutdown } from './config/database';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// If running behind a proxy (Render/Railway/Nginx), trust X-Forwarded-* headers
app.set('trust proxy', 1);

// ============================================
// Middleware Setup
// ============================================

// Security & compression
app.use(...securityMiddleware);

// CORS configuration
app.use(corsConfig);

// Rate limiting (on API routes)
app.use('/api/', rateLimiter);

// Body parsing
app.use(...bodyParserMiddleware);

// ============================================
// API Setup
// ============================================

// Initialize Swagger
const swaggerSpec = swaggerConfig(PORT);

// Register all routes and documentation
registerRoutes(app, swaggerSpec);

// ============================================
// Server Startup
// ============================================

const startServer = async () => {
  try {
    // Connect to database
    if (process.env.NODE_ENV !== 'test') {
      await connectDatabase();
      setupGracefulShutdown();
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Port: ${PORT}`);
      console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;