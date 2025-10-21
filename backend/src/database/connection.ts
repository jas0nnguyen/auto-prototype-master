/**
 * Neon PostgreSQL Connection Configuration
 *
 * This file provides connection configuration for Neon PostgreSQL database
 * using the @neondatabase/serverless driver which is optimized for edge
 * and serverless environments.
 *
 * Connection Pooling:
 * - Use DATABASE_URL (pooled) for most application queries
 * - Use DATABASE_URL_UNPOOLED for migrations and schema operations
 */

import { neon, neonConfig, Pool } from '@neondatabase/serverless';

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  /** Pooled connection URL (recommended for queries) */
  databaseUrl: string;
  /** Unpooled connection URL (for migrations) */
  databaseUrlUnpooled?: string;
  /** Enable WebSocket mode (required for transactions) */
  useWebSocket?: boolean;
  /** Connection pool size */
  poolSize?: number;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error(
      'Database connection URL not found. ' +
      'Please set DATABASE_URL or POSTGRES_URL environment variable.'
    );
  }

  return {
    databaseUrl,
    databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING,
    useWebSocket: process.env.NODE_ENV === 'production',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
  };
}

/**
 * Configure Neon client settings
 */
export function configureNeon(config: DatabaseConfig): void {
  // Enable WebSocket mode for transactions in production
  neonConfig.webSocketConstructor = config.useWebSocket ? WebSocket : undefined;

  // Configure connection pooling
  neonConfig.poolQueryViaFetch = true;

  // Set fetch connection cache for better performance
  neonConfig.fetchConnectionCache = true;
}

/**
 * Create a Neon SQL client for queries
 *
 * This is the recommended approach for one-off queries.
 * For Drizzle ORM integration, use createNeonPool() instead.
 *
 * @example
 * ```typescript
 * const sql = createNeonClient();
 * const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
 * ```
 */
export function createNeonClient() {
  const config = getDatabaseConfig();
  configureNeon(config);
  return neon(config.databaseUrl);
}

/**
 * Create a Neon connection pool for Drizzle ORM
 *
 * This pool is used by Drizzle for database operations.
 * It handles connection pooling automatically.
 *
 * @example
 * ```typescript
 * const pool = createNeonPool();
 * const db = drizzle(pool);
 * ```
 */
export function createNeonPool() {
  const config = getDatabaseConfig();
  configureNeon(config);

  return new Pool({
    connectionString: config.databaseUrl,
    max: config.poolSize,
    connectionTimeoutMillis: config.connectionTimeout,
  });
}

/**
 * Create an unpooled Neon client for migrations
 *
 * Migrations and schema operations should use unpooled connections
 * to avoid connection pool issues during long-running operations.
 *
 * @example
 * ```typescript
 * const sql = createUnpooledClient();
 * await sql`CREATE TABLE ...`;
 * ```
 */
export function createUnpooledClient() {
  const config = getDatabaseConfig();
  const unpooledUrl = config.databaseUrlUnpooled || config.databaseUrl;

  configureNeon(config);
  return neon(unpooledUrl);
}

/**
 * Test database connection
 *
 * Validates that the database connection is working correctly.
 * Useful for health checks and startup validation.
 *
 * @throws Error if connection fails
 */
export async function testConnection(): Promise<boolean> {
  try {
    const sql = createNeonClient();
    const result = await sql`SELECT NOW() as current_time`;

    if (result && result.length > 0) {
      console.log(`[Database] Connection successful. Server time: ${result[0].current_time}`);
      return true;
    }

    throw new Error('Empty result from database');
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
    throw error;
  }
}

/**
 * Close database connections gracefully
 *
 * Should be called during application shutdown to ensure
 * all connections are properly closed.
 */
export async function closeConnections(pool?: Pool): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('[Database] Connection pool closed');
  }
}
