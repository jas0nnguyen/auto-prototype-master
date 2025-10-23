/**
 * CORS and Security Middleware Configuration
 *
 * Configures Cross-Origin Resource Sharing (CORS) and basic security headers
 * for the API. Allows frontend application to access backend endpoints.
 */

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Get CORS configuration based on environment
 *
 * Development: Allow localhost origins
 * Production: Only allow configured frontend URL
 *
 * @returns CORS options for NestJS
 */
export function getCorsConfig(): CorsOptions {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (nodeEnv === 'development') {
    return {
      origin: [
        'http://localhost:5173', // Vite dev server
        'http://localhost:3000', // Alternative frontend port
        'http://localhost:4173', // Vite preview
        'http://127.0.0.1:5173',
        frontendUrl,
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
      credentials: true,
      maxAge: 3600, // Cache preflight requests for 1 hour
    };
  }

  // Production configuration
  return {
    origin: (origin, callback) => {
      const allowedOrigins = [
        frontendUrl,
        // Vercel deployment URLs
        'https://auto-prototype-master.vercel.app',
        'https://auto-prototype-master-*.vercel.app', // Preview deployments
        // Add production domains here
        'https://yourdomain.com',
        'https://www.yourdomain.com',
      ];

      // Allow same-origin requests (when frontend and API are on same domain)
      if (!origin || allowedOrigins.some(allowed =>
        allowed.includes('*') ? origin.match(new RegExp(allowed.replace('*', '.*'))) : origin === allowed
      )) {
        callback(null, true);
      } else {
        console.error(`❌ CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24 hours in production
  };
}

/**
 * Security headers middleware
 *
 * Adds security headers to all responses.
 * These headers protect against common web vulnerabilities.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection in browsers
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Prevent DNS prefetching (optional, may impact performance)
    'X-DNS-Prefetch-Control': 'off',

    // Download options for IE (prevent file execution in site's context)
    'X-Download-Options': 'noopen',

    // Disable client-side caching for API responses
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Content Security Policy (CSP) header
 *
 * Defines approved sources of content for the application.
 * This helps prevent XSS, clickjacking, and other code injection attacks.
 *
 * Note: This is primarily for HTML responses. API endpoints typically
 * don't need strict CSP.
 */
export function getCSPHeader(): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "font-src 'self' https: data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "object-src 'none'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self' https: 'unsafe-inline'",
    "upgrade-insecure-requests",
  ];

  return directives.join('; ');
}

/**
 * Rate limiting configuration
 *
 * Prevents abuse by limiting the number of requests from a single IP.
 */
export interface RateLimitConfig {
  ttl: number; // Time window in seconds
  limit: number; // Maximum requests in time window
}

/**
 * Get rate limit configuration based on environment
 *
 * @returns Rate limit configuration
 */
export function getRateLimitConfig(): RateLimitConfig {
  return {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // 60 seconds
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests
  };
}

/**
 * Trusted proxies configuration
 *
 * When running behind a proxy (e.g., nginx, Vercel), configure which
 * proxies to trust for IP forwarding.
 */
export function getTrustedProxies(): string[] | boolean {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv === 'production') {
    // In production, trust Vercel proxy
    return true; // Trust all proxies (Vercel sets x-forwarded-* headers)
  }

  // In development, don't trust proxies
  return false;
}

/**
 * CORS preflight cache duration
 *
 * How long browsers should cache CORS preflight (OPTIONS) responses.
 */
export function getCorsMaxAge(): number {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return nodeEnv === 'production'
    ? 86400 // 24 hours in production
    : 3600; // 1 hour in development
}
