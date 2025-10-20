# Phase 3 Partial: Database Migrations (Task T046)

**Completed**: 2025-10-19
**Goal**: Generate SQL migration files from Drizzle schema definitions for all 27 US1 database tables.

**IMPORTANT NOTE**: Tasks T023-T045 (creating individual schema files) were completed previously but not documented in the learning summaries. Those tasks created the 27 schema TypeScript files that T046 uses to generate the SQL migration.

## What We Built

### 1. Updated Drizzle Kit Configuration (Prerequisite)
- Updated `drizzle.config.ts` to use new v0.31+ syntax
- **What changed**:
  - `driver: 'pg'` → `dialect: 'postgresql'` (new API)
  - `dbCredentials.connectionString` → `dbCredentials.url` (renamed property)
- **Why needed**: drizzle-kit v0.20 → v0.31 had breaking changes in configuration format
- **Analogy**: Like updating your GPS app to use new map format - same destination, different instructions

### 2. Generated Initial Database Migration (T046)
- Ran `npx drizzle-kit generate` to create migration from schema files
- Created `database/migrations/0000_large_ink.sql` (20KB SQL file)
- Created `database/migrations/meta/_journal.json` (migration tracking log)
- **What it does**: Reads all 27 TypeScript schema files and converts them to PostgreSQL CREATE TABLE statements
- **Analogy**: Like a translator converting architectural blueprints (TypeScript schemas) into construction instructions (SQL statements)

## Migration File Contents

The generated migration includes:

**27 CREATE TABLE Statements** with proper:
- UUID primary keys with `gen_random_uuid()` defaults
- Timestamp fields with `DEFAULT now()`
- VARCHAR, INTEGER, NUMERIC, DATE, TEXT column types
- UNIQUE constraints (e.g., VIN must be unique)

**27 ALTER TABLE Statements** with foreign keys:
- `ON DELETE cascade` - Deleting parent deletes children (e.g., delete Policy → delete Premiums)
- `ON DELETE no action` - Prevents deletion if children exist (e.g., can't delete Product if Policies use it)
- `REFERENCES "public"."table_name"` - Links to parent tables

**Example from Migration File**:

```sql
-- Create the vehicle table
CREATE TABLE "vehicle" (
  "vehicle_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "vin" varchar(17) NOT NULL,
  "year" integer NOT NULL,
  "make" varchar(100) NOT NULL,
  "model" varchar(100) NOT NULL,
  -- ... 19 more columns ...
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "vehicle_vin_unique" UNIQUE("vin")
);

-- Create foreign key linking vehicle to insurable_object
ALTER TABLE "vehicle"
  ADD CONSTRAINT "vehicle_vehicle_identifier_insurable_object_insurable_object_identifier_fk"
  FOREIGN KEY ("vehicle_identifier")
  REFERENCES "public"."insurable_object"("insurable_object_identifier")
  ON DELETE cascade;
```

**What this means**:
- `uuid PRIMARY KEY DEFAULT gen_random_uuid()` - Automatically creates random unique IDs
- `NOT NULL` - Field is required (can't be empty)
- `UNIQUE("vin")` - No two vehicles can have same VIN
- `FOREIGN KEY ... REFERENCES` - vehicle_identifier must match an existing insurable_object
- `ON DELETE cascade` - If insurable_object is deleted, delete the vehicle too

## Tables Created (27 Total)

**Party & Contact (5 tables)**
1. `party` - People or organizations
2. `person` - Individual person details
3. `communication_identity` - Email, phone numbers
4. `geographic_location` - Locations/addresses
5. `location_address` - Structured address data

**Account & Product (2 tables)**
6. `account` - Customer accounts
7. `product` - Insurance products offered

**Policy & Agreement (2 tables)**
8. `agreement` - Contractual agreements (base)
9. `policy` - Insurance policies (extends agreement)

**Vehicles (2 tables)**
10. `insurable_object` - Things that can be insured (base)
11. `vehicle` - Cars/trucks (extends insurable_object)

**Coverage Details (6 tables)**
12. `coverage_part` - Coverage categories (Liability, Collision, etc.)
13. `coverage` - Specific coverages available
14. `policy_coverage_detail` - Coverages selected for a policy
15. `policy_limit` - Maximum payout amounts
16. `policy_deductible` - What customer pays first
17. `policy_amount` - Money amounts

**Rating & Pricing (5 tables)**
18. `rating_factor` - Factors affecting price (age, location, etc.)
19. `rating_table` - Lookup tables for rating
20. `discount` - Price reductions
21. `surcharge` - Price increases
22. `premium_calculation` - Complete calculation audit trail (23 fields!)

**Relationships (3 tables)**
23. `account_party_role` - Links people to accounts
24. `agreement_party_role` - Links people to policies
25. `insurable_object_party_role` - Links people to vehicles

**Other (2 tables)**
26. `assessment` - Damage assessments
27. `account_agreement` - Links accounts to agreements

## Key Concepts Learned

**Migration Files** = Versioned database changes
- Each migration is numbered (0000, 0001, 0002...)
- Contains SQL to apply changes (CREATE TABLE, ALTER TABLE, etc.)
- Tracked in `_journal.json` so Drizzle knows what's been applied
- **Analogy**: Like Git commits for your database structure - each migration is a checkpoint

**Foreign Keys** = Data relationships
- Link one table to another (e.g., vehicle → insurable_object)
- Enforce referential integrity (can't have orphaned records)
- Control cascade behavior (what happens when parent is deleted)
- **Syntax**: `FOREIGN KEY (child_column) REFERENCES parent_table(parent_column)`

**UUID Primary Keys** = Globally unique identifiers
- 128-bit random numbers (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- No collision risk even across databases
- Generated by database with `gen_random_uuid()`
- **Analogy**: Like social security numbers - guaranteed unique across entire system

**ON DELETE Cascade** = Automatic cleanup
- `ON DELETE cascade` - Delete children when parent deleted (tight coupling)
- `ON DELETE no action` - Prevent deletion if children exist (loose coupling)
- **Example**: Delete policy → cascade delete premiums, discounts, surcharges
- **Analogy**: Like deleting a folder deletes all files inside (cascade) vs. preventing deletion if files exist (no action)

**Schema-First Workflow** = Define structure in code
1. Write TypeScript schema files (`.schema.ts`)
2. Run `drizzle-kit generate` to create SQL migrations
3. Review generated SQL
4. Apply migration with `drizzle-kit push`
- **Benefit**: Type-safe, version-controlled, reviewable changes

## Migration Journal Explained

`database/migrations/meta/_journal.json`:
```json
{
  "version": "7",           // Drizzle Kit schema version
  "dialect": "postgresql",  // Database type
  "entries": [
    {
      "idx": 0,                    // Migration index (first one)
      "version": "7",              // Schema version
      "when": 1760921124223,       // Unix timestamp (Oct 19, 2025)
      "tag": "0000_large_ink",     // Migration filename
      "breakpoints": true          // Enables transaction safety
    }
  ]
}
```

**What it does**: Tracks which migrations have been applied so Drizzle doesn't re-run them.

## Migration Execution (ACTUAL T046 Completion)

After generating the migration file, we needed to **actually apply it** to the Neon PostgreSQL database. This revealed several challenges:

### Challenge 1: drizzle-kit push Interactive Prompts
- `npx drizzle-kit push` shows interactive confirmation menu
- Attempted automation methods:
  - ❌ Echo/pipe stdin: `echo "Yes" | npx drizzle-kit push`
  - ❌ Keyboard codes via spawn: `child.stdin.write('\x1B[B')`
  - ❌ Heredoc scripts with timed input
- **Root cause**: Interactive UI library doesn't respond to simple stdin
- **Lesson**: Interactive CLIs aren't scriptable - need alternative approaches

### Challenge 2: Neon Serverless Client API
- `@neondatabase/serverless` requires specific syntax
- ❌ Tried: `sql(rawSQL)` → Error: "must use tagged template"
- ❌ Tried: `sql.query(rawSQL)` with statement splitting
- ✅ Solution: `sql.query(statement, [])` for each individual statement
- **Lesson**: Always check database client docs - APIs vary widely

### Challenge 3: SQL Statement Parsing
- Migration file contains 54 statements (27 CREATE + 27 ALTER)
- Separated by `--> statement-breakpoint` comments
- ❌ First attempt: Execute as one block → only 1 table created
- ✅ Solution: Split on `--> statement-breakpoint`, filter, execute individually
```javascript
const statements = migrationSQL
  .split('--> statement-breakpoint')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

for (const statement of statements) {
  await sql.query(statement, []);
}
```
- **Lesson**: Migration files need careful parsing - can't blindly execute

### Challenge 4: Partial Migration Recovery
- First successful run created only `account_agreement` table
- Second run failed: "relation already exists"
- ✅ Solution: Drop existing tables, rerun full migration
```javascript
await sql`DROP TABLE IF EXISTS account_agreement CASCADE`;
// Then execute all statements fresh
```
- **Lesson**: Development migrations should be idempotent or cleaned before rerun

### Final Working Solution
Created `drop-and-migrate.mjs`:
```javascript
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL);
const migrationSQL = fs.readFileSync('database/migrations/0000_large_ink.sql', 'utf-8');

// Split and execute each statement
const statements = migrationSQL
  .split('--> statement-breakpoint')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

for (const statement of statements) {
  await sql.query(statement, []);
}
```

**Result**:
- ✅ Executed 54 statements successfully
- ✅ Created all 27 tables
- ✅ Created all 27 foreign key constraints
- ✅ Database verified with 27 tables + 27 FKs

## Migration Best Practices Learned

### 1. Don't Rely on Interactive CLIs for Automation
- drizzle-kit push is great for manual review but not CI/CD
- Alternative: Write custom scripts using database client directly
- Or use `drizzle-kit migrate` if migrations are already generated

### 2. Understand Your Database Client API
- Neon serverless: `sql.query(rawSQL, [])`
- Neon tagged template: `` sql`SELECT...` ``
- Traditional pg: `client.query(sql, params)`
- Read docs before assuming syntax

### 3. Parse Migration Files Carefully
- Split by recognized delimiters (Drizzle uses `--> statement-breakpoint`)
- Filter empty statements
- Execute in order (CREATE before ALTER)
- Handle multi-statement transactions appropriately

### 4. Make Migrations Recoverable
- Use `DROP TABLE IF EXISTS` in dev for clean reruns
- Production migrations need more careful rollback strategies
- Always verify results after execution
- Keep migration files in version control

### 5. Verify Don't Trust
- Always query `information_schema` to confirm:
```javascript
// Count tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

// Count foreign keys
SELECT COUNT(*) FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';
```
- Don't assume success from lack of errors

## Why T046 Was Critical

T046 is the **bridge between code and database**:
1. ✅ Schema definitions written in TypeScript (T023-T045)
2. ✅ SQL migration generated from schemas (T046 part 1)
3. ✅ Migration applied to create actual tables (T046 part 2 - COMPLETED)
4. ⏳ Services can now query/insert data (Phase 3 remaining tasks)

**Without T046**, we'd have:
- Schema definitions but no actual database tables
- No way for backend services to store data
- APIs would fail trying to query non-existent tables
- Frontend would have nowhere to send quote requests

## The Restaurant Analogy Continued

T046 was **actually constructing the storage infrastructure**:
- ✅ You have recipe cards (TypeScript schemas)
- ✅ Architect drew detailed blueprints (SQL migration file)
- ✅ Construction crew built all storage areas (27 tables created)
- ✅ Installed locks and security systems (27 foreign keys)
- ✅ Labeled all the shelves and drawers (column names, constraints)
- ❌ Haven't stocked the pantry yet (no seed data)
- ❌ Haven't hired the cooks yet (no services)
- ❌ Haven't opened for business yet (no API endpoints)

**Next steps in Phase 3**: Stock the pantry (seed reference data), hire cooks (build services), open the doors (create API endpoints).

**Total Progress**: 23/170 tasks complete (14%)
