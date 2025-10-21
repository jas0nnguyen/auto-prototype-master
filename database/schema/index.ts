/**
 * Database Schema Index
 *
 * Exports all OMG P&C Data Model entities and rating engine entities.
 * Import this file when using Drizzle ORM in the application.
 */

// Core Party Entities
export * from './party.schema';
export * from './person.schema';
export * from './communication-identity.schema';
export * from './geographic-location.schema';
export * from './location-address.schema';

// Account & Product Entities
export * from './account.schema';
export * from './product.schema';

// Agreement & Policy Entities
export * from './agreement.schema';
export * from './policy.schema';

// Insurable Object Entities
export * from './insurable-object.schema';
export * from './vehicle.schema';

// Coverage Entities
export * from './coverage-part.schema';
export * from './coverage.schema';
export * from './policy-coverage-detail.schema';
export * from './policy-limit.schema';
export * from './policy-deductible.schema';
export * from './policy-amount.schema';

// Rating Engine Entities
export * from './rating-factor.schema';
export * from './rating-table.schema';
export * from './discount.schema';
export * from './surcharge.schema';
export * from './premium-calculation.schema';

// Party Role Relationships
export * from './party-roles.schema';

// Assessment Entity
export * from './assessment.schema';

// Account-Agreement Relationship
export * from './account-agreement.schema';

// Base Schema Utilities
export * from './_base.schema';
