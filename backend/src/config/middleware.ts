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
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
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
