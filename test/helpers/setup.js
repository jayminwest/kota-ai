/**
 * Global test setup file for Vitest
 *
 * This file is automatically loaded by Vitest before running tests.
 * It contains global setup code that runs once before all test suites.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
// Environment variables for testing
process.env.NODE_ENV = 'test';
// Global setup - runs once before all tests
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Setting up test environment...');
    // Add global test setup logic here (database connections, mocks, etc.)
}));
// Global teardown - runs once after all tests
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Tearing down test environment...');
    // Add global test teardown logic here (close connections, clean up, etc.)
}));
// Setup that runs before each test
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // Setup that runs before each individual test
}));
// Teardown that runs after each test
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // Reset any mocks or state after each test
    vi.restoreAllMocks();
}));
