/**
 * Vercel Serverless Function Adapter for NestJS Backend
 *
 * This file adapts the NestJS application to run as a Vercel Serverless Function.
 *
 * HOW IT WORKS:
 * - Vercel treats files in /api directory as serverless functions
 * - Each request creates a new function invocation
 * - NestJS app is cached between invocations for performance
 * - All routes are handled by this single function
 *
 * RESTAURANT ANALOGY:
 * Traditional NestJS = Restaurant that's always open
 * Vercel Serverless = Pop-up restaurant that opens when customers arrive
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../backend/src/app.module';
import { AllExceptionsFilter } from '../backend/src/api/middleware/error-handler';
import { getCorsConfig, getSecurityHeaders } from '../backend/src/api/middleware/cors';
import express, { Request, Response } from 'express';

/**
 * Cached NestJS application instance
 *
 * IMPORTANT: Vercel serverless functions are "warm" for ~5 minutes after use.
 * We cache the NestJS app to avoid bootstrapping on every request.
 */
let cachedApp: any = null;

/**
 * Bootstrap the NestJS application
 *
 * This function creates and configures the NestJS app.
 * It only runs once per "warm" serverless function instance.
 */
async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  // Create Express instance for Vercel
  const expressApp = express();

  // Create NestJS app with Express adapter
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn', 'log'], // Reduce logging in production
    }
  );

  // Enable CORS for frontend communication
  app.enableCors(getCorsConfig());

  // Apply security headers to all responses
  app.use((req: any, res: any, next: any) => {
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  });

  // Global exception filter for error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Initialize the app (but don't call listen() for serverless)
  await app.init();

  // Cache the app instance
  cachedApp = expressApp;

  console.log('✅ NestJS app initialized for Vercel Serverless');

  return expressApp;
}

/**
 * Vercel Serverless Function Handler
 *
 * This is the entry point for all HTTP requests.
 * Vercel calls this function for every request to /api/*
 */
export default async function handler(req: Request, res: Response) {
  try {
    // Get or create the NestJS app
    const app = await bootstrap();

    // Pass the request to Express/NestJS
    app(req, res);

  } catch (error) {
    console.error('❌ Serverless function error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
