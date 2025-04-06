/**
 * Test utilities for the KOTA-AI project
 *
 * This file contains common utilities and helpers for testing.
 * It can be imported in any test file.
 */
import { vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
// Type-safe mock creation to address TS18046
export function createMock() {
    return vi.hoisted(() => ({}));
}
// Fixture helpers
export function loadFixture(fixturePath) {
    const fullPath = path.join(__dirname, '../fixtures', fixturePath);
    return fs.readFileSync(fullPath, 'utf-8');
}
// Create temporary test files
export function createTempFile(content) {
    const tempDir = path.join(__dirname, '../temp');
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, `temp-${Date.now()}-${Math.random().toString(36).substring(2)}.txt`);
    fs.writeFileSync(filePath, content);
    return {
        path: filePath,
        cleanup: () => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    };
}
// Clean up all temp files
export function cleanupTempFiles() {
    const tempDir = path.join(__dirname, '../temp');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}
// Create a test directory structure
export function createTestDir() {
    const testDir = path.join(__dirname, '../temp', `test-dir-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
    return {
        path: testDir,
        cleanup: () => {
            if (fs.existsSync(testDir)) {
                fs.rmSync(testDir, { recursive: true, force: true });
            }
        }
    };
}
