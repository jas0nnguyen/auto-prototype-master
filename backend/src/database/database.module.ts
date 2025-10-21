/**
 * Database Module
 *
 * NestJS module that provides database connectivity and Drizzle ORM instance.
 * This module makes the database available to all services via dependency injection.
 */

import { Global, Module, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import {
  createNeonPool,
  testConnection,
  closeConnections,
} from './connection';
import type { Database } from './drizzle.config';

/**
 * Database connection token for dependency injection
 */
export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

/**
 * Database pool token for dependency injection
 */
export const DATABASE_POOL = 'DATABASE_POOL';

/**
 * Database provider factory
 *
 * Creates the Drizzle database instance with Neon connection pool.
 */
const databaseProviders = [
  {
    provide: DATABASE_POOL,
    useFactory: (): Pool => {
      return createNeonPool();
    },
  },
  {
    provide: DATABASE_CONNECTION,
    inject: [DATABASE_POOL],
    useFactory: (pool: Pool): Database => {
      // Create Drizzle instance with the pool
      return drizzle(pool, {
        // Schema will be added here when entity schemas are created
        // schema: { ...allSchemas },
        logger: process.env.NODE_ENV === 'development',
      });
    },
  },
];

/**
 * Database Module
 *
 * Global module that provides database connectivity to all application modules.
 * The @Global() decorator makes database providers available everywhere without
 * needing to import DatabaseModule in every module.
 *
 * @example
 * ```typescript
 * // In a service
 * import { Injectable, Inject } from '@nestjs/common';
 * import { DATABASE_CONNECTION } from '../database/database.module';
 * import type { Database } from '../database/drizzle.config';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @Inject(DATABASE_CONNECTION) private db: Database,
 *   ) {}
 *
 *   async findAll() {
 *     return this.db.select().from(myTable);
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [DATABASE_CONNECTION, DATABASE_POOL],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Test database connection on module initialization
   *
   * This ensures the database is accessible when the application starts.
   * If connection fails, the application will not start.
   */
  async onModuleInit(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    console.log(`[DatabaseModule] Initializing in ${nodeEnv} mode`);

    try {
      await testConnection();
      console.log('[DatabaseModule] Database connection established successfully');
    } catch (error) {
      console.error('[DatabaseModule] Failed to connect to database:', error);
      throw error; // Prevent app from starting with broken database
    }
  }

  /**
   * Close database connections on module destruction
   *
   * Ensures graceful shutdown by closing all database connections
   * when the application shuts down.
   */
  async onModuleDestroy(): Promise<void> {
    console.log('[DatabaseModule] Closing database connections...');
    await closeConnections(this.pool);
    console.log('[DatabaseModule] Database connections closed');
  }
}
