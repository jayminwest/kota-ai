# Issue: Easy MCP Server Integration with Smithery SDK

## Description

Currently, adding MCP servers to KOTA requires manual configuration through CLI commands. We should implement a more streamlined approach that allows users to add multiple MCP servers at once using a single JSON configuration file, similar to how tools like Smithery SDK work.

## Background

[Smithery](https://github.com/smithery-ai/typescript-sdk) is a TypeScript framework that makes it easier to connect language models to Model Context Protocols (MCPs). It provides a simple way to connect to multiple MCPs with a single client.

## Requirements

1. Create a new command to import MCP servers from a JSON file:
   ```
   kota mcp import <file-path>
   ```

2. Support a JSON schema that allows defining multiple MCP servers in a single file, including:
   - Server name
   - Transport type (stdio, http)
   - Connection details
   - Display name
   - Description
   - Default flag

3. Validate the JSON file against the schema before importing

4. Handle conflicts with existing server configurations (prompt to overwrite or skip)

5. Add documentation for the new feature

## Example JSON Format

```json
{
  "servers": [
    {
      "name": "exa-search",
      "displayName": "Exa Search",
      "description": "Search the web with Exa",
      "transportType": "http",
      "connection": {
        "url": "https://example.com/exa-mcp",
        "apiKey": "YOUR_API_KEY"
      },
      "isDefault": true
    },
    {
      "name": "local-tools",
      "displayName": "Local Development Tools",
      "description": "Local development tools",
      "transportType": "stdio",
      "connection": {
        "command": "node",
        "args": ["./local-mcp-server.js"]
      }
    }
  ]
}
```

## Implementation Notes

- Use the existing MCP client infrastructure
- Consider adding a `--force` flag to overwrite existing configurations without prompting
- Add proper error handling for invalid JSON files
- Consider supporting YAML format as an alternative

## Related Issues

- Issue #004: Run Command Execution
