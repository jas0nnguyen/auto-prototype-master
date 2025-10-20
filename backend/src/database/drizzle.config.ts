/**
 * Drizzle ORM Configuration
 *
 * This file configures Drizzle ORM for type-safe database operations
 * with the Neon PostgreSQL database.
 *
 * Drizzle provides:
 * - Type-safe query builder
 * - Compile-time type checking
 * - Automatic TypeScript inference
 * - Schema migrations
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { createNeonPool, createNeonClient } from './connection';

/**
 * Database instance type
 * This is the main Drizzle database instance used throughout the application
 */
export type Database = ReturnType<typeof drizzle>;

/**
 * Create Drizzle database instance with connection pool
 *
 * This is the recommended approach for production use.
 * The pool manages connections efficiently and provides better performance.
 *
 * @example
 * ```typescript
 * const db = createDrizzleDb();
 * const users = await db.select().from(usersTable);
 * ```
 */
export function createDrizzleDb(): Database {
  const pool = createNeonPool();

  // Create Drizzle instance with schema
  // Schema will be imported once we create entity definitions
  return drizzle(pool, {
    // Schema will be added here: schema: { ...allSchemas }
    logger: process.env.NODE_ENV === 'development',
  });
}

/**
 * Create Drizzle database instance with direct connection
 *
 * This approach uses the Neon SQL function directly without a pool.
 * Useful for simple scripts or serverless functions.
 *
 * @example
 * ```typescript
 * const db = createDrizzleDbDirect();
 * const users = await db.select().from(usersTable);
 * ```
 */
export function createDrizzleDbDirect(): ReturnType<typeof drizzle<NeonQueryFunction<false, false>>> {
  const sql = createNeonClient();

  return drizzle(sql, {
    logger: process.env.NODE_ENV === 'development',
  });
}

/**
 * Global database instance
 *
 * This instance is used throughout the application for database operations.
 * It's created once and reused to maintain connection pool efficiency.
 *
 * Note: In NestJS, this will be provided via dependency injection
 * through the DatabaseModule. This export is for direct usage outside
 * of the NestJS context (e.g., standalone scripts, tests).
 */
let dbInstance: Database | null = null;

/**
 * Get or create the global database instance
 *
 * This singleton pattern ensures we reuse the same connection pool
 * across the application.
 */
export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = createDrizzleDb();
  }
  return dbInstance;
}

/**
 * Reset database instance
 *
 * Useful for testing or when you need to recreate the connection.
 */
export function resetDatabase(): void {
  dbInstance = null;
}
