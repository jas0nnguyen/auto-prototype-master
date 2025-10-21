import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const sql = neon(process.env.DATABASE_URL);

const migrationSQL = readFileSync('./database/migrations/0002_pink_mole_man.sql', 'utf-8');

// Split by statement breakpoint and execute each statement
const statements = migrationSQL.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

console.log(`Applying ${statements.length} migration statements...`);

for (const statement of statements) {
  console.log(`Executing: ${statement.substring(0, 60)}...`);
  try {
    await sql(statement);
    console.log('✓ Success');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

console.log('Migration completed!');
process.exit(0);
