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
        'https://gentle-cheesecake-5c1663.netlify.app/',
        ...envOrigins,
      ].filter(Boolean) as string[])
    );

    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn(`CORS blocked: ${origin}`);
    return callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
