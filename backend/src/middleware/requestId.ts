/**
 * Request ID Tracking Middleware
 * ==============================
 * 
 * Assigns a unique ID to each request for debugging and tracing.
 * The ID is either taken from the X-Request-ID header (for distributed tracing)
 * or generated using UUID v4.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Generate a UUID v4 for request tracking
 * Uses crypto.randomUUID if available, falls back to manual generation
 */
const generateRequestId = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generation
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;  // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80;  // Variant 1
  
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
};

/**
 * Request ID middleware
 * Attaches a unique request ID to each request for tracing
 * 
 * Usage: app.use(requestId);
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  // Use existing X-Request-ID header if provided, otherwise generate new one
  const existingId = req.headers['x-request-id'] as string;
  const id = existingId || generateRequestId();
  
  // Attach to request object
  req.requestId = id;
  
  // Also attach as 'id' for backwards compatibility
  req.id = id;
  
  // Set response header so clients can correlate responses
  res.setHeader('X-Request-ID', id);
  
  next();
};

/**
 * Request ID getter
 * Helper function to safely get request ID from request object
 */
export const getRequestId = (req: Request): string => {
  return req.requestId || req.id || 'unknown';
};

export default requestId;
