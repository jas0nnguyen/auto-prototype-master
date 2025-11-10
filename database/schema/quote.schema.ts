/**
 * Quote Schema
 *
 * Re-exports the policy table as 'quotes' for signature schema compatibility.
 * In our data model, quotes are policies with status='QUOTED'.
 *
 * This file exists to support the signature schema which references a 'quotes' table.
 */

import { policy } from './policy.schema';

// Export policy table as 'quotes' for foreign key references
export const quotes = policy;

// Re-export types
export type { Policy as Quote, NewPolicy as NewQuote } from './policy.schema';
