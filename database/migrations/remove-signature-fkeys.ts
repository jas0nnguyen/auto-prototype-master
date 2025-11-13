/**
 * Remove Foreign Key Constraints from Signature Table
 * Allows demo mode where party_id may equal quote_id and not exist in party table
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function removeForeignKeys() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);

  console.log('🔄 Removing foreign key constraints from signature table...');

  try {
    // Drop party_id foreign key constraint
    console.log('  📝 Dropping signature_party_id_fkey constraint...');
    await sql`ALTER TABLE "signature" DROP CONSTRAINT IF EXISTS "signature_party_id_fkey"`;

    // Drop quote_id foreign key constraint
    console.log('  📝 Dropping signature_quote_id_fkey constraint...');
    await sql`ALTER TABLE "signature" DROP CONSTRAINT IF EXISTS "signature_quote_id_fkey"`;

    console.log('✅ Foreign key constraints removed successfully!');
    console.log('\nSignature table now supports demo mode:');
    console.log('  ✓ party_id can be any UUID (does not need to exist in party table)');
    console.log('  ✓ quote_id can be any UUID (does not need to exist in policy table)');
    console.log('  ✓ Indexes remain active for query performance');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

removeForeignKeys();
