### Unit Testing with Jest

- **All unit tests should use [Jest](https://jestjs.io/)**.
  - Ensure Jest and necessary types (`@types/jest`) are added as dev dependencies.
  - Configure Jest appropriately for TypeScript and ESM (e.g., using `ts-jest` or Node's native ESM support).
- Write unit tests for individual functions, classes, and modules.
- Test files should be named `[target].test.ts` and placed in the same directory as the code they are testing (NOT a separate directory).
  - Good example: `src/utils/paths.ts` and `src/utils/paths.test.ts`
  - Bad example: `src/utils/paths.ts` and `src/test/paths.test.ts` or `test/paths.test.ts` or `src/__tests__/paths.test.ts`
- Tests should be run with `npm test`.
- It's acceptable to use `any`/`unknown` in test files (such as `*.test.ts`) or test fixtures (like `**/test-data.ts`) to facilitate mocking or stubbing external modules or partial function arguments, referencing the usage guidelines in the TypeScript section. However, do not use `any` or `unknown` in production code.
- Aim for clear, concise tests focusing on one aspect per test case (`it(...)`).
- Use `describe` blocks to group related tests.
