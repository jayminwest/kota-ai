/**
 * Test utilities for the KOTA-AI project
 *
 * This file contains common utilities and helpers for testing.
 * It can be imported in any test file.
 */
import type { Mock } from 'vitest';
export declare function createMock<T extends object>(): {
    [K in keyof T]: Mock;
};
export declare function loadFixture(fixturePath: string): string;
export declare function createTempFile(content: string): {
    path: string;
    cleanup: () => void;
};
export declare function cleanupTempFiles(): void;
export declare function createTestDir(): {
    path: string;
    cleanup: () => void;
};
