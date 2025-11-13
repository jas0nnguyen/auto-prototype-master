/**
 * Delete Test Signature
 * Removes the test signature created during development
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function deleteTestSignature() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);

  const quoteId = '3c14c7b7-3f5d-43b2-82bd-13481f226547'; // DZT0QBMXQ9

  console.log(`🔄 Deleting test signature for quote ${quoteId}...`);

  try {
    const result = await sql`DELETE FROM "signature" WHERE quote_id = ${quoteId}`;

    console.log(`✅ Deleted ${result.length || 0} signature(s)`);
    console.log('\nYou can now test the signature flow again in the browser.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Delete failed:', error);
    process.exit(1);
  }
}

deleteTestSignature();
