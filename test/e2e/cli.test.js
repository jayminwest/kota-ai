var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * End-to-end tests for CLI functionality
 *
 * These tests verify that the CLI works correctly from end to end
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { createTestDir } from '../helpers/test-utils';
const execAsync = promisify(exec);
// Get the path to the CLI script
const CLI_PATH = path.resolve(process.cwd(), 'dist/cli.js');
// Skip these tests if running in CI environment to avoid side effects
const SKIP_E2E = process.env.CI === 'true';
describe('CLI End-to-End', () => {
    // Create a temporary directory for test files
    let tempDir;
    beforeAll(() => {
        if (SKIP_E2E)
            return;
        // Create a temporary directory for test files
        tempDir = createTestDir();
        // Set environment variables for testing
        process.env.KOTA_HOME = tempDir.path;
    });
    afterAll(() => {
        if (SKIP_E2E)
            return;
        // Clean up temporary files
        tempDir.cleanup();
        // Reset environment variables
        delete process.env.KOTA_HOME;
    });
    it.skipIf(SKIP_E2E)('should display help information', () => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execAsync(`node ${CLI_PATH} help`);
        expect(stdout).toContain('Usage: kota <command>');
        expect(stdout).toContain('Available commands:');
    }));
    it.skipIf(SKIP_E2E)('should initialize KOTA directories', () => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execAsync(`node ${CLI_PATH} init`);
        expect(stdout).toContain('KOTA initialized successfully');
        // Check if directories were created
        const kotaDir = path.join(tempDir.path, '.kota-ai');
        const notesDir = path.join(kotaDir, 'notes');
        expect(fs.existsSync(kotaDir)).toBe(true);
        expect(fs.existsSync(notesDir)).toBe(true);
    }));
    it.skipIf(SKIP_E2E)('should show error for unknown command', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield execAsync(`node ${CLI_PATH} unknown-command`);
            // Should not reach here
            expect(true).toBe(false);
        }
        catch (error) {
            expect(error.stderr).toContain('Unknown command: unknown-command');
        }
    }));
});
