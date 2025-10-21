/**
 * API Response Formatters
 *
 * Standardized response formatting for all API endpoints.
 * Ensures consistent response structure across the application.
 */

import { HttpStatus } from '@nestjs/common';

/**
 * Standard success response interface
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: ResponseMeta;
}

/**
 * Response metadata interface
 */
export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API Response type (success or error)
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a successful response
 *
 * @param data - Response data
 * @param message - Optional success message
 * @param meta - Optional metadata
 * @returns Formatted success response
 *
 * @example
 * ```typescript
 * return success({ quote_id: '123', premium: 1200 }, 'Quote created successfully');
 * ```
 */
export function success<T>(
  data: T,
  message?: string,
  meta?: Partial<ResponseMeta>
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create an error response
 *
 * @param code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @param message - Error message
 * @param details - Optional error details
 * @param meta - Optional metadata
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return error('QUOTE_NOT_FOUND', 'Quote with ID 123 not found');
 * ```
 */
export function error(
  code: string,
  message: string,
  details?: unknown,
  meta?: Partial<ResponseMeta>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create a paginated response
 *
 * @param data - Array of items
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @param totalItems - Total number of items across all pages
 * @param message - Optional success message
 * @returns Formatted paginated response
 *
 * @example
 * ```typescript
 * return paginated(quotes, 1, 10, 45, 'Quotes retrieved successfully');
 * ```
 */
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number,
  message?: string
): SuccessResponse<T[]> {
  const totalPages = Math.ceil(totalItems / limit);

  const paginationMeta: PaginationMeta = {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return success(data, message, { pagination: paginationMeta });
}

/**
 * Create a created response (201)
 *
 * @param data - Created resource
 * @param message - Optional success message
 * @returns Formatted success response
 *
 * @example
 * ```typescript
 * return created({ quote_id: '123' }, 'Quote created successfully');
 * ```
 */
export function created<T>(data: T, message?: string): SuccessResponse<T> {
  return success(data, message || 'Resource created successfully');
}

/**
 * Create a no content response (204)
 *
 * @param message - Optional message
 * @returns Formatted success response with null data
 *
 * @example
 * ```typescript
 * return noContent('Quote deleted successfully');
 * ```
 */
export function noContent(message?: string): SuccessResponse<null> {
  return success(null, message || 'Operation completed successfully');
}

/**
 * Create a validation error response
 *
 * @param validationErrors - Object with field names as keys and error arrays as values
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return validationError({
 *   email: ['Email is required', 'Email must be valid format'],
 *   phone: ['Phone number is invalid']
 * });
 * ```
 */
export function validationError(
  validationErrors: Record<string, string[]>
): ErrorResponse {
  return error(
    'VALIDATION_ERROR',
    'Validation failed',
    validationErrors
  );
}

/**
 * Create a not found error response
 *
 * @param resourceType - Type of resource (e.g., 'Quote', 'Policy')
 * @param resourceId - ID of the resource
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return notFound('Quote', '123');
 * ```
 */
export function notFound(
  resourceType: string,
  resourceId?: string
): ErrorResponse {
  const message = resourceId
    ? `${resourceType} with ID ${resourceId} not found`
    : `${resourceType} not found`;

  return error('NOT_FOUND', message);
}

/**
 * Create an unauthorized error response
 *
 * @param message - Optional custom message
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return unauthorized('Invalid API key');
 * ```
 */
export function unauthorized(message?: string): ErrorResponse {
  return error(
    'UNAUTHORIZED',
    message || 'Unauthorized access'
  );
}

/**
 * Create a forbidden error response
 *
 * @param message - Optional custom message
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return forbidden('You do not have permission to access this resource');
 * ```
 */
export function forbidden(message?: string): ErrorResponse {
  return error(
    'FORBIDDEN',
    message || 'Access forbidden'
  );
}

/**
 * Create a bad request error response
 *
 * @param message - Error message
 * @param details - Optional error details
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return badRequest('Invalid quote data', { field: 'vehicle_vin' });
 * ```
 */
export function badRequest(message: string, details?: unknown): ErrorResponse {
  return error('BAD_REQUEST', message, details);
}

/**
 * Create a conflict error response
 *
 * @param message - Error message
 * @param details - Optional error details
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return conflict('Quote already exists', { quote_number: 'QTE-2025-123456' });
 * ```
 */
export function conflict(message: string, details?: unknown): ErrorResponse {
  return error('CONFLICT', message, details);
}

/**
 * Create an internal server error response
 *
 * @param message - Error message
 * @param details - Optional error details (only in development)
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return internalError('Database connection failed');
 * ```
 */
export function internalError(message?: string, details?: unknown): ErrorResponse {
  const isProduction = process.env.NODE_ENV === 'production';

  return error(
    'INTERNAL_SERVER_ERROR',
    isProduction ? 'An internal server error occurred' : (message || 'Internal server error'),
    isProduction ? undefined : details
  );
}

/**
 * Create a service unavailable error response
 *
 * @param message - Error message
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * return serviceUnavailable('Payment gateway is temporarily unavailable');
 * ```
 */
export function serviceUnavailable(message?: string): ErrorResponse {
  return error(
    'SERVICE_UNAVAILABLE',
    message || 'Service temporarily unavailable'
  );
}

/**
 * Transform NestJS exception to formatted error response
 *
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param code - Error code
 * @returns Formatted error response
 */
export function fromException(
  statusCode: number,
  message: string,
  code?: string
): ErrorResponse {
  const errorCode = code || getErrorCodeFromStatus(statusCode);
  return error(errorCode, message);
}

/**
 * Get error code from HTTP status code
 *
 * @param statusCode - HTTP status code
 * @returns Error code string
 */
function getErrorCodeFromStatus(statusCode: number): string {
  const statusMap: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
  };

  return statusMap[statusCode] || 'UNKNOWN_ERROR';
}
