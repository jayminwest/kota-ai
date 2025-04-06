/**
 * End-to-end tests for CLI functionality
 * 
 * These tests verify that the CLI works correctly from end to end
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { createTempFile, createTestDir } from '../helpers/test-utils.js';

const execAsync = promisify(exec);

// Get the path to the CLI script
const CLI_PATH = path.resolve(process.cwd(), 'dist/cli.js');

// Skip these tests if running in CI environment to avoid side effects
const SKIP_E2E = process.env.CI === 'true';

describe('CLI End-to-End', () => {
  // Create a temporary directory for test files
  let tempDir: { path: string; cleanup: () => void };
  
  beforeAll(() => {
    if (SKIP_E2E) return;
    
    // Create a temporary directory for test files
    tempDir = createTestDir();
    
    // Set environment variables for testing
    process.env.KOTA_HOME = tempDir.path;
  });
  
  afterAll(() => {
    if (SKIP_E2E) return;
    
    // Clean up temporary files
    tempDir.cleanup();
    
    // Reset environment variables
    delete process.env.KOTA_HOME;
  });

  it.skipIf(SKIP_E2E)('should display help information', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} help`);
    expect(stdout).toContain('Usage: kota <command>');
    expect(stdout).toContain('Available commands:');
  });

  it.skipIf(SKIP_E2E)('should initialize KOTA directories', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} init`);
    
    expect(stdout).toContain('KOTA initialized successfully');
    
    // Check if directories were created
    const kotaDir = path.join(tempDir.path, '.kota-ai');
    const notesDir = path.join(kotaDir, 'notes');
    
    expect(fs.existsSync(kotaDir)).toBe(true);
    expect(fs.existsSync(notesDir)).toBe(true);
  });
  
  it.skipIf(SKIP_E2E)('should show error for unknown command', async () => {
    try {
      await execAsync(`node ${CLI_PATH} unknown-command`);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.stderr).toContain('Unknown command: unknown-command');
    }
  });
});
