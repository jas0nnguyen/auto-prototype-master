/**
 * Drizzle Kit Configuration
 *
 * This file configures Drizzle Kit for database migrations and schema management.
 * Drizzle Kit is the CLI tool used to generate and run migrations.
 *
 * Commands:
 * - `npm run db:generate` - Generate migrations from schema changes
 * - `npm run db:migrate` - Apply pending migrations to database
 * - `npm run db:push` - Push schema changes directly (dev only)
 * - `npm run db:studio` - Open Drizzle Studio (database GUI)
 */

import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Drizzle Kit Configuration
 */
export default {
  // Database dialect for PostgreSQL
  dialect: 'postgresql',

  // Database connection string
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '',
  },

  // Schema file locations
  schema: './database/schema/**/*.schema.ts',

  // Migration output directory
  out: './database/migrations',

  // Verbose logging
  verbose: true,

  // Strict mode (fail on warnings)
  strict: true,

  // Table prefix (optional)
  // tablesFilter: ['auto_insurance_*'],
} satisfies Config;
