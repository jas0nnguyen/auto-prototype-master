/**
 * API Rate Limiting Middleware
 *
 * Prevents abuse by limiting requests per IP address
 */

import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RateLimiter');
  private readonly requestCounts = new Map<string, RateLimitEntry>();

  // Configuration
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS = 100; // Default limit
  private readonly MAX_POST_REQUESTS = 20; // Stricter for POST endpoints

  use(req: Request, res: Response, next: NextFunction): void {
    // Whitelist localhost for development
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1')) {
      return next();
    }

    // Determine limit based on method
    const limit = req.method === 'POST' ? this.MAX_POST_REQUESTS : this.MAX_REQUESTS;

    // Get or create rate limit entry
    const now = Date.now();
    let entry = this.requestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + this.WINDOW_MS,
      };
      this.requestCounts.set(ip, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      this.logger.warn(`Rate limit exceeded for IP: ${ip} (${entry.count}/${limit} requests)`);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
        {
          cause: new Error('Rate limit exceeded'),
        }
      );
    }

    // Add rate limit headers to response
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    next();
  }

  /**
   * Clean up expired entries periodically
   */
  cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [ip, entry] of this.requestCounts.entries()) {
      if (now > entry.resetTime) {
        this.requestCounts.delete(ip);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }
}

/**
 * Start periodic cleanup (call once in main.ts)
 */
export function startRateLimiterCleanup(middleware: RateLimiterMiddleware): NodeJS.Timeout {
  return setInterval(() => {
    middleware.cleanupExpiredEntries();
  }, 60 * 1000); // Run every minute
}
