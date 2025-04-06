import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Global test settings
    globals: true,
    environment: 'happy-dom', // For DOM tests
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/*.ts',
      ],
    },
    // Set up different test types
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
    // Configure timeouts for slower tests
    testTimeout: 10000,
    hookTimeout: 10000,
    // For better error messages
    passWithNoTests: true,
    isolate: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
    },
  },
});
