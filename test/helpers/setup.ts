/**
 * Global test setup file for Vitest
 * 
 * This file is automatically loaded by Vitest before running tests.
 * It contains global setup code that runs once before all test suites.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Environment variables for testing
process.env.NODE_ENV = 'test';

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('Setting up test environment...');
  // Add global test setup logic here (database connections, mocks, etc.)
});

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log('Tearing down test environment...');
  // Add global test teardown logic here (close connections, clean up, etc.)
});

// Setup that runs before each test
beforeEach(async () => {
  // Setup that runs before each individual test
});

// Teardown that runs after each test
afterEach(async () => {
  // Reset any mocks or state after each test
  vi.restoreAllMocks();
});
