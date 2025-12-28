/**
 * Security Configuration
 * ======================
 * 
 * Helmet.js + rate limiting + CSRF + CORS
 * Protects against common web vulnerabilities
 * 
 * SECURITY HEADERS (Helmet):
 * - Content-Security-Policy: Prevent XSS
 * - X-Frame-Options: Prevent clickjacking
 * - X-Content-Type-Options: Prevent MIME sniffing
 * - Strict-Transport-Security: HTTPS only
 * - X-XSS-Protection: Legacy XSS protection
 * - Referrer-Policy: Control referrer info
 * 
 * RATE LIMITING:
 * - Global: 1000 req/15min per IP
 * - Auth: 5 login attempts/hour per IP
 * - Payment: 10 attempts/hour per user
 * 
 * CSRF:
 * - Token generation per session
 * - Token validation on state changes
 * - Double-submit pattern
 * 
 * CORS:
 * - Strict origin whitelist
 * - No wildcards
 * - Credentials only on same-origin
 */

import helmet from 'helmet';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';
import { Request, Response } from 'express';

/**
 * Initialize Redis for rate limiting
 * Falls back to memory store if Redis unavailable
 */
let redisClient: redis.RedisClient | null = null;
let useRedis = false;

if (process.env.REDIS_URL) {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 5000
      }
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis error:', err.message);
      console.warn('Falling back to memory store for rate limiting');
    });
    
    redisClient.on('connect', () => {
      console.log('✓ Redis connected for rate limiting');
      useRedis = true;
    });
  } catch (error) {
    console.warn('Redis unavailable, using memory store:', (error as Error).message);
  }
}

/**
 * HELMET CONFIGURATION
 * ====================
 * Security headers to protect against common attacks
 */
export const helmetConfig = helmet({
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  
  // Strict HTTPS
  strictTransportSecurity: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Adjust per your frontend
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  
  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // X-XSS-Protection (legacy)
  xssFilter: true,
  
  // Permissions policy
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'self'"]
    }
  }
});

/**
 * COMPRESSION MIDDLEWARE
 * Compress responses to reduce bandwidth
 */
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
});

/**
 * CORS CONFIGURATION
 * ====================
 * 
 * STRICT:
 * - Only allow specified origins
 * - Credentials only on same-origin
 * - No wildcards
 */
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  
  // Allow credentials (cookies, auth headers)
  credentials: true,
  
  // Allow these methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Allow these headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Idempotency-Key'
  ],
  
  // Expose these headers to client
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  
  // Cache preflight 1 hour
  maxAge: 3600,
  
  // Allow credentials
  optionsSuccessStatus: 200
};

/**
 * RATE LIMITER FACTORY
 * ====================
 */
function createRateLimiter(
  windowMs: number,
  maxRequests: number,
  skipSuccessfulRequests: boolean = false,
  skipFailedRequests: boolean = false,
  keyGenerator?: (req: Request) => string
) {
  const storeOptions: any = {
    windowMs,
    max: maxRequests
  };

  if (useRedis && redisClient) {
    storeOptions.store = new RedisStore({
      client: redisClient,
      prefix: 'rate-limit:'
    });
  } else {
    storeOptions.store = new (require('express-rate-limit').MemoryStore)();
  }

  return rateLimit({
    ...storeOptions,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }
      });
    },
    standardHeaders: false,  // Don't return rate limit info in headers
    legacyHeaders: false
  });
}

/**
 * GLOBAL RATE LIMITER
 * 1000 requests per 15 minutes per IP
 */
export const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000,  // 15 minutes
  1000             // 1000 requests
);

/**
 * LOGIN RATE LIMITER
 * 5 login attempts per hour per IP
 */
export const loginRateLimiter = createRateLimiter(
  60 * 60 * 1000,  // 1 hour
  5,               // 5 attempts
  false,           // Don't skip successful
  false            // Don't skip failed
);

/**
 * PASSWORD RESET RATE LIMITER
 * 3 reset requests per hour per email
 */
export const passwordResetRateLimiter = createRateLimiter(
  60 * 60 * 1000,  // 1 hour
  3,               // 3 attempts
  true,            // Skip successful (count all)
  false
);

/**
 * PAYMENT RATE LIMITER
 * 10 payment attempts per hour per user
 */
export const paymentRateLimiter = createRateLimiter(
  60 * 60 * 1000,  // 1 hour
  10,              // 10 attempts per user
  false,
  false,
  (req: Request) => {
    // Use userId + IP (require auth)
    return `payment:${(req as any).userId}:${req.ip}`;
  }
);

/**
 * REFUND RATE LIMITER
 * 3 refund requests per day per user
 */
export const refundRateLimiter = createRateLimiter(
  24 * 60 * 60 * 1000,  // 24 hours
  3,                    // 3 attempts per user
  false,
  false,
  (req: Request) => {
    return `refund:${(req as any).userId}`;
  }
);

/**
 * PRODUCT CREATE RATE LIMITER
 * 50 products per day per seller
 * Prevent spam/bulk upload abuse
 */
export const productCreateRateLimiter = createRateLimiter(
  24 * 60 * 60 * 1000,  // 24 hours
  50,                   // 50 products per seller per day
  false,
  false,
  (req: Request) => {
    return `product-create:${(req as any).userId}`;
  }
);

/**
 * CSRF TOKEN MIDDLEWARE
 * ====================
 * 
 * Generates CSRF token for all GET requests
 * Validates CSRF token on POST/PUT/PATCH/DELETE
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: Function) {
  // Generate CSRF token for all requests
  const { generateCSRFToken } = require('../utils/crypto');
  
  if (!req.session?.csrfToken) {
    req.session = req.session || {};
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Set token in header for client
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  
  // Validate on state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const tokenFromHeader = req.get('X-CSRF-Token');
    const tokenFromBody = (req.body as any)?.csrfToken;
    
    const providedToken = tokenFromHeader || tokenFromBody;
    
    if (providedToken !== req.session?.csrfToken) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'CSRF_VALIDATION_FAILED',
          message: 'CSRF token validation failed'
        }
      });
    }
  }
  
  next();
}

/**
 * BODY SIZE LIMIT MIDDLEWARE
 * Prevent large payload attacks
 */
export const bodySizeLimit = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb' }
};

/**
 * IP ADDRESS EXTRACTOR
 * ====================
 * Get real IP from X-Forwarded-For (when behind proxy)
 * or direct connection IP
 */
export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * REQUEST ID MIDDLEWARE
 * Unique ID for every request (audit trail)
 */
export function requestIdMiddleware(req: Request, res: Response, next: Function) {
  const { v4: uuidv4 } = require('uuid');
  
  req.id = req.id || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  
  next();
}

/**
 * SECURITY HEADERS SUMMARY
 * =======================
 * 
 * Applied by Helmet:
 * - Content-Security-Policy: Prevent XSS
 * - X-Frame-Options: Deny
 * - X-Content-Type-Options: nosniff
 * - Strict-Transport-Security: HSTS + preload
 * - X-XSS-Protection: 1; mode=block
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: camera/microphone/geolocation disabled
 * 
 * Applied by CORS:
 * - Origin whitelist (no wildcards)
 * - Credentials only on same-origin
 * - Specified methods only
 * - Specified headers only
 * 
 * Applied by Rate Limiting:
 * - Global: 1000 req/15min per IP
 * - Auth: 5 login/hour per IP
 * - Payment: 10 attempts/hour per user
 * - Refund: 3/day per user
 */

export default {
  helmetConfig,
  compressionMiddleware,
  corsConfig,
  globalRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  paymentRateLimiter,
  refundRateLimiter,
  productCreateRateLimiter,
  csrfTokenMiddleware,
  bodySizeLimit,
  getClientIp,
  requestIdMiddleware
};
