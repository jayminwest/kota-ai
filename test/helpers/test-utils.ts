/**
 * Test Utilities
 * This file contains utility functions for tests.
 */

import { expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Creates a temporary test file
 * @param content File content
 * @param extension File extension (default: .txt)
 * @returns Path to the temporary file
 */
export function createTempFile(content: string, extension = '.txt'): string {
  const tempDir = path.join(process.cwd(), 'test-temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filename = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}${extension}`;
  const filepath = path.join(tempDir, filename);
  
  fs.writeFileSync(filepath, content, 'utf8');
  return filepath;
}

/**
 * Removes a temporary test file
 * @param filepath Path to the file to remove
 */
export function removeTempFile(filepath: string): void {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

/**
 * Waits for a specified amount of time
 * @param ms Time to wait in milliseconds
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a mock for a class or object with specified methods
 * @param methods Methods to include in the mock
 * @returns A mock object with the specified methods
 */
export function createMock<T>(methods: Record<string, any> = {}): T {
  return methods as T;
}

/**
 * Asserts that a function throws an error
 * @param fn Function to test
 * @param errorType Expected error type or message (optional)
 */
export function assertThrows(fn: () => any, errorType?: string | RegExp | Function): void {
  try {
    fn();
    throw new Error('Function did not throw an error');
  } catch (error: unknown) {
    if (errorType) {
      if (typeof errorType === 'string' && error instanceof Error) {
        expect(error.message).toContain(errorType);
      } else if (errorType instanceof RegExp && error instanceof Error) {
        expect(error.message).toMatch(errorType);
      } else if (typeof errorType === 'function') {
        expect(error).toBeInstanceOf(errorType);
      }
    }
  }
}
