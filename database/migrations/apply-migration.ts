/**
 * Manual Migration Script
 * Applies the signature table migration to Neon PostgreSQL
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function applyMigration() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);

  console.log('🔄 Applying signature table migration...');

  try {
    // Create signature table
    console.log('  📝 Creating signature table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "signature" (
        "signature_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "quote_id" uuid NOT NULL,
        "party_id" uuid NOT NULL,
        "signature_image_data" text NOT NULL,
        "signature_format" varchar(10) NOT NULL,
        "signature_date" timestamp DEFAULT now() NOT NULL,
        "ip_address" varchar(45),
        "user_agent" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;

    // Create indexes
    console.log('  📝 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS "signature_quote_id_idx" ON "signature" ("quote_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "signature_party_id_idx" ON "signature" ("party_id")`;

    console.log('✅ Signature table created successfully!');
    console.log('\nTable structure:');
    console.log('  - signature_id (uuid, PK)');
    console.log('  - quote_id (uuid)');
    console.log('  - party_id (uuid)');
    console.log('  - signature_image_data (text)');
    console.log('  - signature_format (varchar)');
    console.log('  - signature_date (timestamp)');
    console.log('  - ip_address (varchar)');
    console.log('  - user_agent (text)');
    console.log('  - created_at (timestamp)');
    console.log('  - updated_at (timestamp)');
    console.log('\nIndexes created:');
    console.log('  - signature_quote_id_idx');
    console.log('  - signature_party_id_idx');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
