# Issue 004: Implement Terminal Command Execution via /run

**Date:** 2025-04-04

**Status:** Open

## Description

The persistent chat interface currently includes a placeholder for a `/run` command. This issue tracks the implementation of this feature, allowing users to execute terminal commands directly from the chat input.

## Requirements

1.  **Command Execution:** When a user types `/run <command> [args...]`, the specified command should be executed in the user's default shell environment.
2.  **Output Capture:** The standard output (stdout) and standard error (stderr) streams of the executed command should be captured.
3.  **Display Output:** The captured output (or an error message if the command fails) should be displayed in the chat interface as a system message.
4.  **Contextual Inclusion (Optional):** Provide a mechanism (e.g., a follow-up prompt or a specific syntax like `/run -a <command>`) for the user to optionally include both the executed command and its output as context for the AI in subsequent interactions. This would allow the AI to understand the results of the command.
5.  **Security Considerations:** Implement appropriate safeguards to prevent accidental or malicious command execution. Consider potential risks and how to mitigate them (e.g., confirmation prompts for potentially dangerous commands, disallowing certain commands).
6.  **Error Handling:** Gracefully handle errors during command execution (e.g., command not found, permission denied) and display informative messages to the user.

## Implementation Notes

-   The `child_process` module in Node.js (specifically `exec` or `spawn`) can be used for command execution.
-   Care must be taken when handling user input to prevent command injection vulnerabilities.
-   The `PersistentChatInterface` class in `src/persistentChat.ts` will likely need modification to the `executeCommand` method and potentially the `processInput` method.

## Acceptance Criteria

-   Users can type `/run ls -l` and see the directory listing in the chat window.
-   Users can type `/run git status` and see the git status output.
-   Errors during command execution are reported clearly.
-   (Optional) Users have a way to add the command and its output to the AI's context.
