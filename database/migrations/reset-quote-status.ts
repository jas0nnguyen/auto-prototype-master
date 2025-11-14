/**
 * Reset Quote Status
 * Resets a quote from BOUND back to QUOTED for testing purposes
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function resetQuoteStatus() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);

  const quoteNumber = 'DZT8LJHS7S';

  console.log(`🔄 Resetting quote ${quoteNumber} status from BOUND to QUOTED...`);

  try {
    // Update policy status
    const result = await sql`
      UPDATE "policy"
      SET status_code = 'QUOTED'
      WHERE policy_number = ${quoteNumber}
    `;

    console.log(`✅ Reset ${result.length || 0} quote(s)`);
    console.log('✅ Quote is now ready for binding again.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetQuoteStatus();
