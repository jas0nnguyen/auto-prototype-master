# Database Seeds

This directory contains seed data for development and demo purposes.

## Overview

Seed data populates the database with realistic sample data for:
- Rating tables (base rates, multipliers)
- Mock vehicle data (VIN decoder database)
- Coverage products and definitions
- Demo quotes and policies

## Seed Files

```
seeds/
├── README.md                    # This file
├── run-seeds.ts                 # Seed runner script
├── rating-tables.sql            # Base rates and rating multipliers
├── mock-vehicles.ts             # VIN decoder sample data
├── coverage-products.ts         # Product and coverage definitions
└── demo-data.ts                 # Sample quotes/policies for testing
```

## Running Seeds

### All Seeds
```bash
# From backend directory
cd backend
npm run db:seed
```

### Individual Seed Files
```bash
cd backend
tsx ../database/seeds/rating-tables.sql
```

## Seed Data Contents

### 1. Rating Tables
- Base premium rates by state
- Vehicle rating multipliers (age, make, model)
- Driver rating factors (age, experience, violations)
- Location rating multipliers (zip code, urban/rural)
- Discount definitions and percentages
- Surcharge definitions and percentages

### 2. Mock Vehicles
- ~100 common vehicles with VIN patterns
- Make, model, year, trim data
- Safety ratings (NHTSA/IIHS)
- Estimated values

### 3. Coverage Products
- Standard auto insurance product
- Coverage parts (BI, PD, Collision, Comprehensive, etc.)
- Default limits and deductibles
- Coverage descriptions

### 4. Demo Data (Optional)
- Sample customer profiles
- Pre-created quotes for testing
- Sample policies in various states
- Test claim records

## Development Guidelines

1. **Idempotent Seeds**: Seeds should be safe to run multiple times
2. **Use Transactions**: Wrap seeds in transactions for rollback
3. **Clear Data**: Optionally truncate tables before seeding
4. **Realistic Data**: Use production-like values and distributions
5. **Document Sources**: Note where external data comes from

## Example Seed Structure

```typescript
import { getDatabase } from '../../backend/src/database/drizzle.config';
import { party, person } from '../schema/party.schema';

export async function seedDemoData() {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    // Insert sample party
    const [partyRecord] = await tx.insert(party).values({
      party_name: 'John Doe',
      party_type_code: 'PERSON',
    }).returning();

    // Insert person details
    await tx.insert(person).values({
      person_identifier: partyRecord.party_identifier,
      first_name: 'John',
      last_name: 'Doe',
      birth_date: new Date('1985-06-15'),
    });
  });

  console.log('Demo data seeded successfully');
}
```

## Important Notes

- ⚠️ **Never run seeds in production** - seeds are for development only
- ⚠️ **Check environment** before running seeds
- ⚠️ **Backup data** before running seeds that truncate tables
- ⚠️ **Version control** all seed files for reproducibility
