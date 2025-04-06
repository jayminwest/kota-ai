# Testing Guide for KOTA-AI

This document outlines the testing framework and guidelines for the KOTA-AI project.

## Testing Framework

KOTA-AI uses [Vitest](https://vitest.dev/) as its primary testing framework. Vitest is a fast and feature-rich testing framework designed for Vite and compatible with Jest's API.

## TypeScript Configuration

The project uses two TypeScript configurations:

1. **Main configuration (`tsconfig.json`)**: This is used for building the project and includes only the source files. It sets `rootDir` to `./src` and excludes test files.

2. **Test configuration (`tsconfig.test.json`)**: This extends the main configuration but includes test files and sets `rootDir` to the project root to avoid TypeScript errors in test files.

When running tests, the test configuration is used automatically by Vitest.

## Test Directory Structure

The tests are organized into the following categories:

```
test/
├── unit/            # Unit tests for individual components
│   ├── mcp/         # Tests for MCP-related functionality
│   └── types/       # Tests for type definitions (if needed)
├── integration/     # Integration tests for component interactions
├── e2e/             # End-to-end tests for complete workflows
├── fixtures/        # Test data and fixtures
└── helpers/         # Test utilities and setup functions
```

## Running Tests

The following npm scripts are available for running tests:

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI visualizer
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests
- `npm run test:e2e` - Run only end-to-end tests
- `npm run typecheck:all` - Type check all files including tests

## Test Categories

### Unit Tests

Unit tests focus on individual functions, classes, or modules in isolation. They should:

- Test a single unit of code
- Mock external dependencies
- Be fast and deterministic
- Focus on inputs and outputs

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../../src/yourModule.js';

describe('yourFunction', () => {
  it('should return the expected result for valid input', () => {
    const result = yourFunction('valid input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Tests

Integration tests verify that different components work together correctly. They:

- Test interactions between multiple components
- Use real implementations when possible
- May use the filesystem or network in controlled ways
- Focus on component relationships and interfaces

### End-to-End Tests

E2E tests verify complete workflows from the user's perspective. They:

- Test the application as a whole
- Run against a production-like environment
- Interact with the system as a user would
- May be slower but provide confidence in overall functionality

## Test Data and Fixtures

Use test fixtures from `test/fixtures/` to provide consistent test data across tests:

```typescript
import { sampleAnthropicResponse } from '../fixtures/test-data.js';

// Use the fixture in your test
expect(result).toEqual(sampleAnthropicResponse);
```

## Mocking Guidelines

- **Default to real implementations** when possible, especially for unit tests of business logic.
- Use mocks for:
  - External API calls
  - Services that are difficult to replicate in tests
  - Time-based operations that could cause flaky tests
- Document when and why a mock is used with comments.

Example:
```typescript
// Mock external API
vi.mock('../../src/externalApi.js', () => ({
  callExternalApi: vi.fn().mockResolvedValue({ success: true }),
}));
```

## Coverage Requirements

- Critical components should aim for at least 80% test coverage.
- All new code should include appropriate tests.
- The coverage report can be generated with `npm run test:coverage`.

## Writing Good Tests

1. **Use descriptive test names** that explain expected behavior.
2. **Follow the AAA pattern**: Arrange, Act, Assert.
3. **Keep tests independent** - they should not depend on each other.
4. **Test edge cases** and error conditions, not just happy paths.
5. **Keep tests simple and focused** on a specific behavior.

## Continuous Integration

The CI pipeline will automatically run tests on each pull request and prevent merging if tests fail or coverage drops below the threshold.

## Troubleshooting

### Common Issues

1. **TypeScript errors in test files**: If you get TypeScript errors in test files, make sure you're using the test configuration by running `npm run typecheck:all` instead of `npm run typecheck`.

2. **Module import errors**: Ensure you're using the correct path formats with `.js` extensions in import statements, even when importing TypeScript files.

3. **Testing asynchronous code**: Use `async/await` or return the promise to ensure Vitest waits for the test to complete.

---

For any questions about testing, please contact the project maintainers.
