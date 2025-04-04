# Error Handling

- Use standard `Error` objects for throwing errors.
- For specific operational errors where distinct handling might be needed, create custom error classes extending `Error` (e.g., `class ConfigError extends Error {}`).
- Always handle potential errors from asynchronous operations using `try...catch` with `await` or `.catch()` with Promises.
- Provide informative error messages that help diagnose the problem.
- Log errors appropriately using the standard logging mechanisms (`console.error`). Avoid swallowing errors silently.
- When catching and re-throwing errors, consider wrapping the original error to preserve the stack trace and context (e.g., `throw new Error('Failed to initialize KOTA', { cause: originalError });`).
