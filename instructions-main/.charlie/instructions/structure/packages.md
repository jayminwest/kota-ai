# Package Structure

The project must follow these `package.json` rules:

- `type` must be set to `module`.
- `exports` should be used instead of `main` or `module`.
  - ALL production source code should be exported from the root (`.`) path.
  - Any test-specific code should be exported from a `test` path.
  - Exports should point to the compiled JavaScript files (e.g., in `dist/`).
  - Good example:
    - `"exports": { ".": "./dist/index.js", "./test": "./dist/test/index.js" }`
  - BAD example:
    - `"main": "./dist/index.js"` (don't use `main` or `module`)
    - `"exports": "./src/index.ts"` (don't export TypeScript source files)
    - `"exports": { ".": "./dist/index.js", "./test": "./dist/test/index.js", "./test/mocks": "./dist/test/mocks.js" }` (don't export multiple test paths unless absolutely necessary)
- `types` should point to the main declaration file (e.g., `"types": "./dist/index.d.ts"`).
- NEVER use TypeScript path resolution (`paths` in `tsconfig.json`).
  - Use ESM subpath imports instead if this is desired (e.g., `"imports": { "#/utils": "./dist/utils/index.js" }`).


# Directory Structure

The project should have the following structure:

- A `src/` directory containing the core source code.
- A single entrypoint in `src/index.ts` that exports the package's public API.
- Place test helpers, utilities, or mocks in `src/test/` with a single entrypoint in `src/test/index.ts`.
- Tests should be placed beside source code like `src/my-file.ts` and `src/my-file.test.ts` (NOT `src/test/my-file.test.ts` or `test/my-file.test.ts`).
- A standard set of config files (like `package.json` and `tsconfig.json`) to ensure consistency.
- The `package.json` must define an "exports" object with `"." : "./dist/index.js"` and optionally `"./test": "./dist/test/index.js"`, ensuring clearly defined entrypoints for production and test code.

Example:

```
kota-ai/package.json
kota-ai/tsconfig.json
kota-ai/src/index.ts
kota-ai/src/core/client.ts
kota-ai/src/core/client.test.ts
kota-ai/src/test/index.ts
kota-ai/src/test/mocks.ts
```
