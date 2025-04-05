import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable TypeScript support with the test config
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
    
    // Test file patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Environment setup
    environment: 'node',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/types/**', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
      thresholds: {
        // Critical components should have at least 80% coverage
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Testing utilities
    globals: true,
    
    // Output and reporting
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-reports/index.html',
    },
    
    // Performance and reliability settings
    testTimeout: 10000,
    hookTimeout: 10000,
    retry: 0,
    
    // Test isolation
    isolate: true,
  },
});
