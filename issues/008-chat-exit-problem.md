# Issue: Unable to Exit Chat Interface

## Problem Description
Users are unable to exit the KOTA chat interface using standard methods like CTRL+C or other keyboard shortcuts. The application does not respond to termination signals properly, forcing users to use more drastic measures like killing the process from another terminal.

## Current Behavior
- CTRL+C does not exit the application
- No other keyboard shortcuts are available to exit
- Users must forcibly terminate the process

## Expected Behavior
- CTRL+C should cleanly exit the application
- A text command like `/exit` should be available to exit
- ESC key should provide an option to exit

## Technical Details
The current implementation in `src/persistentChat.ts` attempts to handle CTRL+C and process signals, but these handlers are not working correctly. The blessed library may be capturing these signals and preventing them from reaching our handlers.

## Proposed Solution
1. Add multiple exit methods:
   - Fix CTRL+C handling by using blessed's raw key handling
   - Add a `/exit` command that users can type
   - Add an ESC key handler that shows an exit confirmation dialog
   - Ensure all signal handlers are properly registered

2. Implement a more robust cleanup process that ensures the terminal is restored to its original state before exiting.

3. Verify that the .gitignore file includes all automatically generated files:
   - Check that all build artifacts in the `dist/` directory are properly ignored
   - Ensure any log files generated during runtime are ignored
   - Verify that any temporary files created during development are excluded

## Priority
High - This is a critical usability issue that affects all users.

## GitHub Issue Creation
To create this issue on GitHub and assign it to Charlie, run:

```bash
gh issue create --title "Fix: Unable to Exit Chat Interface" --body "$(cat issues/008-chat-exit-problem.md)" --assignee "charlie-helps"
```
