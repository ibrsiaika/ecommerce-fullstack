import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import express from 'express';
import cookieParser from 'cookie-parser';

/**
 * Security middleware configuration
 */
export const securityMiddleware = [
  helmet(),
  compression(),
];

/**
 * Rate limiting configuration
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // max 150 requests per window
  message: 'Too many requests, please try again later.'
});

/**
 * CORS configuration
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    const envOrigins = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const allowedOrigins = Array.from(
      new Set([
        process.env.CLIENT_URL || 'http://localhost:3000',
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        ...envOrigins,
      ].filter(Boolean) as string[])
    );

    const isAllowedOrigin = (requestOrigin: string) => {
      return allowedOrigins.some((allowed) => {
        if (allowed === requestOrigin) return true;
        // Support a minimal wildcard syntax, e.g. "https://*.netlify.app"
        if (allowed.includes('*')) {
          const escaped = allowed
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
          const re = new RegExp(`^${escaped}$`);
          return re.test(requestOrigin);
        }
        return false;
      });
    };

    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) return callback(null, true);

    console.warn(`CORS blocked: ${origin}`);
    // Do NOT throw here; throwing causes a 500 and browsers show confusing errors.
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204
});

/**
 * Body parsing configuration
 */
export const bodyParserMiddleware = [
  express.json({ limit: '10mb' }),
  express.urlencoded({ extended: true, limit: '10mb' }),
  cookieParser(),
];

/**
 * Static files configuration
 */
export const staticFilesConfig = {
  path: '/uploads',
  directory: 'uploads'
};
