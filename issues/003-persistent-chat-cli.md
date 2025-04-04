---
title: "Implement Persistent Chat Interface for CLI"
labels: enhancement, cli, ux, chat
assignees: ''
---

## Description

Currently, `kota` commands are executed individually from the shell. This issue proposes enhancing the CLI to provide a persistent, chat-like interface when `kota` is run without any arguments.

**Goal:**

Running `kota` should launch a dedicated terminal application/interface that combines chat functionality with direct command execution.

**Key Features:**

1.  **Persistent Session:** The interface should maintain a continuous session, potentially preserving chat history and context between runs (or at least within a single run).
2.  **Chat Mode:** The primary mode of interaction should be chat-based, likely connecting to the configured MCP server and model (`kota chat` functionality embedded).
3.  **Command Execution:** Users should be able to execute standard `kota` commands directly from within this interface using a special prefix (e.g., `/run`).
    *   Example: `/run list --tag project` should execute the `kota list --tag project` command and display its output within the interface.
    *   Example: `/run config set defaultModel claude-3-7-sonnet`
4.  **Seamless Output:** The output from `/run` commands should be displayed cleanly within the chat flow, distinct from regular chat messages.
5.  **Context Awareness:** Ideally, the chat context could potentially inform or be informed by the commands run via `/run`.
6.  **Standard CLI Fallback:** Running `kota <command> [args]` directly from the shell should still work as it does now, without launching the persistent interface.

**Technical Considerations:**

*   Requires a more sophisticated terminal UI library (e.g., `blessed`, `ink`, or similar) compared to the current basic output.
*   Needs robust input parsing to differentiate between chat messages and `/run` commands.
*   Requires capturing the output of internal command executions and displaying it within the UI.
*   Needs state management for the persistent session.

**Acceptance Criteria:**

*   Running `kota` with no arguments launches the persistent interface.
*   The interface allows for text input.
*   Input not starting with `/run` is treated as a chat message (sent to the configured MCP model).
*   Input starting with `/run ` executes the subsequent text as a `kota` command.
*   Output from `/run` commands is displayed within the interface.
*   Standard `kota init`, `kota list`, etc., commands still work directly from the shell.
*   Exiting the interface (e.g., via `/exit` or Ctrl+C) terminates the session cleanly.

This feature would significantly enhance the user experience, making KOTA feel more like an integrated assistant rather than just a set of separate command-line tools.
