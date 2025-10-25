/**
 * Global Error Handling Middleware
 *
 * Centralized error handling for the NestJS application.
 * Catches all exceptions, logs them, and returns user-friendly responses.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Custom error response interface
 */
export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  details?: unknown;
}

/**
 * Application-specific error types
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(
    public resourceType: string,
    public resourceId: string
  ) {
    super(`${resourceType} with ID ${resourceId} not found`);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends Error {
  constructor(
    message: string,
    public ruleCode?: string
  ) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export class InvalidStatusTransitionError extends BusinessRuleError {
  constructor(
    public currentStatus: string,
    public attemptedStatus: string,
    public resourceType: string = 'Policy'
  ) {
    super(
      `Cannot transition ${resourceType} from ${currentStatus} to ${attemptedStatus}`,
      'INVALID_STATUS_TRANSITION'
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

export class ExpiredQuoteError extends BusinessRuleError {
  constructor(public quoteId: string) {
    super('This quote has expired. Please generate a new quote.', 'QUOTE_EXPIRED');
    this.name = 'ExpiredQuoteError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Global exception filter
 *
 * Catches all exceptions thrown in the application and formats them
 * into consistent error responses. Logs errors for debugging and monitoring.
 *
 * @example
 * ```typescript
 * // In main.ts
 * app.useGlobalFilters(new AllExceptionsFilter());
 * ```
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log the error
    this.logError(exception, request, errorResponse);

    // Send response
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Build error response based on exception type
   */
  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const baseResponse: Omit<ErrorResponse, 'statusCode' | 'message' | 'error'> = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Handle HTTP exceptions (from NestJS)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        ...baseResponse,
        statusCode: status,
        message: typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message,
        error: exception.name,
        details: typeof exceptionResponse === 'object' ? exceptionResponse : undefined,
      };
    }

    // Handle custom validation errors
    if (exception instanceof ValidationError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'ValidationError',
        details: exception.details,
      };
    }

    // Handle database errors
    if (exception instanceof DatabaseError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A database error occurred',
        error: 'DatabaseError',
        details: process.env.NODE_ENV === 'development' ? exception.originalError : undefined,
      };
    }

    // Handle not found errors
    if (exception instanceof NotFoundError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'NotFoundError',
      };
    }

    // Handle expired quote errors
    if (exception instanceof ExpiredQuoteError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.GONE,
        message: exception.message,
        error: 'ExpiredQuoteError',
        details: {
          ruleCode: exception.ruleCode,
          quoteId: exception.quoteId,
          action: 'Please generate a new quote',
        },
      };
    }

    // Handle invalid status transition errors
    if (exception instanceof InvalidStatusTransitionError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: 'InvalidStatusTransitionError',
        details: {
          ruleCode: exception.ruleCode,
          currentStatus: exception.currentStatus,
          attemptedStatus: exception.attemptedStatus,
          resourceType: exception.resourceType,
        },
      };
    }

    // Handle business rule errors
    if (exception instanceof BusinessRuleError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
        error: 'BusinessRuleError',
        details: exception.ruleCode ? { ruleCode: exception.ruleCode } : undefined,
      };
    }

    // Handle unauthorized errors
    if (exception instanceof UnauthorizedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
        error: 'UnauthorizedError',
      };
    }

    // Handle standard Error objects
    if (exception instanceof Error) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.NODE_ENV === 'production'
          ? 'An internal server error occurred'
          : exception.message,
        error: exception.name,
        details: process.env.NODE_ENV === 'development' ? { stack: exception.stack } : undefined,
      };
    }

    // Handle unknown errors
    return {
      ...baseResponse,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'UnknownError',
      details: process.env.NODE_ENV === 'development' ? { exception } : undefined,
    };
  }

  /**
   * Log error with appropriate level
   */
  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const logContext = {
      path: request.url,
      method: request.method,
      statusCode: errorResponse.statusCode,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    // Critical errors (5xx)
    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${errorResponse.error}: ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        JSON.stringify(logContext)
      );
    }
    // Client errors (4xx)
    else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `${errorResponse.error}: ${errorResponse.message}`,
        JSON.stringify(logContext)
      );
    }
    // Other errors
    else {
      this.logger.log(
        `${errorResponse.error}: ${errorResponse.message}`,
        JSON.stringify(logContext)
      );
    }
  }
}

/**
 * HTTP Exception Filter
 *
 * Specialized filter for HTTP exceptions only.
 * Use this if you want different handling for HTTP vs application exceptions.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message,
      error: exception.name,
    };

    this.logger.warn(
      `HTTP ${status} - ${request.method} ${request.url}`,
      JSON.stringify(errorResponse)
    );

    response.status(status).json(errorResponse);
  }
}
