# Asynchronous Operations

- Always use `async`/`await` for handling asynchronous operations (Promises).
- Avoid mixing Promises with callbacks (`.then`/`.catch` are acceptable, but `await` is generally preferred for linear control flow).
- Ensure all Promises returned by functions are handled (either `await`ed or returned). Use ESLint rules like `no-floating-promises` if configured.
- Use `Promise.all` or `Promise.allSettled` for running multiple asynchronous operations concurrently when appropriate.
- Be mindful of error handling within `async` functions using `try...catch`.
