/**
 * CSRF Protection Middleware
 * ==========================
 * 
 * Provides CSRF token generation and validation for state-changing requests.
 * Uses HMAC-SHA256 to generate tokens tied to session IDs.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF secret from environment, with fallback for development
const CSRF_SECRET = process.env.CSRF_SECRET || 'development-csrf-secret-change-in-production';

/**
 * Generate a CSRF token for the given session ID
 * Uses HMAC-SHA256 to create a token tied to the session
 */
export const generateCsrfToken = (sessionId: string): string => {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(sessionId)
    .digest('hex');
};

/**
 * CSRF validation middleware
 * Validates CSRF token for state-changing HTTP methods (POST, PUT, DELETE, PATCH)
 * 
 * Usage: app.use('/api', validateCsrf);
 */
export const validateCsrf = (req: Request, res: Response, next: NextFunction): void => {
  // Only validate for state-changing methods
  const statefulMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (!statefulMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF validation for specific routes that don't need it
  const exemptRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/webhooks'  // Webhooks use their own validation
  ];
  
  if (exemptRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Get session ID from authenticated request
  const sessionId = req.sessionId;
  
  // If no session (unauthenticated), skip CSRF check
  // These routes should be protected by authentication middleware anyway
  if (!sessionId) {
    return next();
  }

  // Get CSRF token from headers
  const token = req.headers['x-csrf-token'] as string;
  
  if (!token) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required'
      }
    });
    return;
  }

  // Generate expected token and validate
  const expectedToken = generateCsrfToken(sessionId);
  
  // Use timing-safe comparison to prevent timing attacks
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expectedToken);
  
  if (tokenBuffer.length !== expectedBuffer.length || 
      !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token'
      }
    });
    return;
  }

  next();
};

/**
 * Middleware to attach CSRF token to response
 * The client can retrieve this token and include it in subsequent requests
 * 
 * Usage: router.get('/csrf-token', attachCsrfToken, handler);
 */
export const attachCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  if (req.sessionId) {
    const csrfToken = generateCsrfToken(req.sessionId);
    res.setHeader('X-CSRF-Token', csrfToken);
  }
  next();
};

/**
 * Route handler to get CSRF token
 * Client can call this endpoint to get a new CSRF token
 */
export const getCsrfToken = (req: Request, res: Response): void => {
  if (!req.sessionId) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required to get CSRF token'
      }
    });
    return;
  }

  const csrfToken = generateCsrfToken(req.sessionId);
  
  res.status(200).json({
    success: true,
    data: {
      csrfToken
    }
  });
};

export default {
  generateCsrfToken,
  validateCsrf,
  attachCsrfToken,
  getCsrfToken
};
