# MCP Auto-Connection Problem

## Issue Description

When using the `kota chat` command with automatic MCP server connection, the connection is established but the chat doesn't properly utilize the MCP server. The current implementation connects to the MCP server but doesn't properly integrate it with the chat functionality.

## Current Behavior

1. When running `kota chat "message"`, the system attempts to auto-connect to the default MCP server
2. The connection appears successful with messages like:
   ```
   Automatically connecting to MCP server: Google Calendar...
   Connected to MCP server: Google Calendar
   ```
3. However, the chat still uses the default AI provider (Anthropic/Ollama) instead of routing through the MCP server
4. The MCP server runs in the background but doesn't process the chat messages

## Expected Behavior

1. When auto-connecting to an MCP server, the chat should route all messages through that server
2. The MCP server should process the messages and return responses
3. The chat should display responses from the MCP server
4. The connection should be properly closed when the chat ends

## Technical Details

The issue appears to be in the integration between the auto-connection code in `commands.ts` and the actual chat functionality in `model-commands.ts`. While we establish a connection to the MCP server, we don't modify the chat pathway to use this connection.

## Proposed Solution

1. Modify the `chatWithModel` function to check if an MCP server is connected
2. If connected, route the message through the MCP server instead of the default AI provider
3. Add proper error handling for MCP communication failures
4. Ensure the MCP connection is properly maintained or closed as needed

## Priority

Medium - This affects the usability of MCP integrations but doesn't break core functionality.
