import { Request, Response, NextFunction } from 'express';

/**
 * Response Time Middleware
 * =======================
 *
 * Measures request processing time and sets it as the X-Response-Time
 * response header (in milliseconds). Useful for:
 *   - Client-side performance monitoring
 *   - Load balancer health scoring
 *   - APM / observability tools
 *
 * Must be placed early in the middleware stack (after reqId, before routes).
 */
export function responseTimeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  // intercept res.end to set the header BEFORE the response is sent
  const originalEnd = res.end.bind(res);
  (res as any).end = (...args: unknown[]) => {
    const elapsedNs = process.hrtime.bigint() - start;
    const elapsedMs = Number(elapsedNs) / 1_000_000;
    try {
      res.setHeader('X-Response-Time', `${elapsedMs.toFixed(2)}ms`);
    } catch {
      // headers may already be sent in edge cases — non-fatal
    }
    return (originalEnd as any)(...args);
  };

  next();
}
