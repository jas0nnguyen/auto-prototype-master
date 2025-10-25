/**
 * Vitest Setup File for Backend Tests
 *
 * This file runs before all test files to configure the testing environment.
 * It sets up:
 * - Environment variables
 * - Global test utilities
 * - Database mocks
 * - NestJS testing utilities
 */

import { config } from 'dotenv';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Load environment variables from .env.test if it exists, otherwise use .env
config({ path: '.env.test' });
config({ path: '.env' });

// Global test configuration
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
});

afterAll(async () => {
  // Cleanup global resources if needed
});

beforeEach(async () => {
  // Reset any global state before each test
});

afterEach(async () => {
  // Cleanup after each test
});
