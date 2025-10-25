/**
 * Request Timing Middleware
 *
 * Logs request duration and warns on slow responses
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestTiming');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Log when request starts
    this.logger.log(`→ ${req.method} ${req.url}`);

    // Capture when response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Build log message
      const logMessage = `← ${req.method} ${req.url} [${statusCode}] ${duration}ms`;

      // Warn if response is slow (>3s as per spec)
      if (duration > 3000) {
        this.logger.warn(
          `${logMessage} ⚠️  SLOW RESPONSE (exceeds 3s threshold)`,
          {
            method: req.method,
            path: req.url,
            statusCode,
            duration,
            threshold: 3000,
          }
        );
      } else if (statusCode >= 500) {
        // Error responses
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        // Client errors
        this.logger.warn(logMessage);
      } else {
        // Successful responses
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

/**
 * Functional middleware variant (for use in main.ts)
 */
export function timingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logMessage = `${req.method} ${req.url} [${statusCode}] ${duration}ms`;

    if (duration > 3000) {
      console.warn(`⚠️  SLOW: ${logMessage} (exceeds 3s threshold)`);
    } else {
      console.log(`✓ ${logMessage}`);
    }
  });

  next();
}
