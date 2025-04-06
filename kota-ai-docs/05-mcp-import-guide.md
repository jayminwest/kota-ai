# MCP Server Import Guide

This guide explains how to use KOTA AI's MCP (Multi-Channel Presence) server import feature to easily configure multiple MCP servers from a single JSON or YAML file.

## Overview

The MCP import feature allows you to:
- Import multiple server configurations at once
- Support both JSON and YAML file formats
- Validate configurations against a schema
- Handle duplicate servers with confirmation or force options

## Command Usage

```bash
kota mcp import <file-path> [--force]
```

### Parameters:
- `<file-path>`: Path to the JSON or YAML file containing server configurations
- `--force` (optional): Overwrite existing server configurations without prompting

## File Format

The import file should contain a JSON or YAML object with a `servers` array containing MCP server configurations.

### JSON Schema

```json
{
  "servers": [
    {
      "name": "string (required)",
      "displayName": "string (optional)",
      "description": "string (optional)",
      "transportType": "stdio | http (required)",
      "isDefault": boolean (optional),
      "connection": {
        // For stdio transport:
        "command": "string (required for stdio)",
        "args": ["string", "..."] (optional),
        "env": { "key": "value" } (optional),
        "cwd": "string" (optional)
        
        // For http transport:
        "url": "string (required for http)",
        "apiKey": "string (optional)",
        "headers": { "key": "value" } (optional)
      }
    }
  ]
}
```

## Example Import File

Here's an example of a JSON import file:

```json
{
  "servers": [
    {
      "name": "local-mcp",
      "displayName": "Local MCP Server",
      "description": "A local MCP server running in stdio mode",
      "transportType": "stdio",
      "isDefault": true,
      "connection": {
        "command": "node",
        "args": ["./mcp-server.js"],
        "cwd": "./local-server"
      }
    },
    {
      "name": "cloud-mcp",
      "displayName": "Cloud MCP Server",
      "description": "A remote MCP server running over HTTP",
      "transportType": "http",
      "connection": {
        "url": "https://example.com/mcp-api",
        "apiKey": "your-api-key-here",
        "headers": {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }
    }
  ]
}
```

## YAML Format Example

KOTA also supports YAML format for importing MCP servers:

```yaml
servers:
  - name: local-mcp
    displayName: Local MCP Server
    description: A local MCP server running in stdio mode
    transportType: stdio
    isDefault: true
    connection:
      command: node
      args:
        - ./mcp-server.js
      cwd: ./local-server
      
  - name: cloud-mcp
    displayName: Cloud MCP Server
    description: A remote MCP server running over HTTP
    transportType: http
    connection:
      url: https://example.com/mcp-api
      apiKey: your-api-key-here
      headers:
        Content-Type: application/json
        Accept: application/json
```

## Handling Existing Configurations

When importing servers with the same name as existing configurations:

1. **Without `--force` flag**: The import will skip existing servers with the same name.
2. **With `--force` flag**: Existing servers will be overwritten with the imported configurations.

## Validation

KOTA validates the import file to ensure:
- Required fields are present
- Transport types are valid
- Connection properties match the transport type

If validation fails, KOTA will show an error message indicating the specific issue.

## Example Workflow

1. Create a JSON or YAML file with your server configurations
2. Run the import command:
   ```bash
   kota mcp import servers.json
   ```
3. Review the import summary:
   ```
   Import summary:
   - 2 server configurations processed
   - 1 new servers added
   - 0 existing servers overwritten
   - 1 servers skipped
   ```
4. If you want to overwrite existing servers, use the `--force` flag:
   ```bash
   kota mcp import servers.json --force
   ```

## Additional Notes

- The import feature supports both JSON (`.json`) and YAML (`.yml`, `.yaml`) file formats
- File extensions are used to determine the format automatically
- Server names must be unique and can only contain letters, numbers, hyphens, and underscores
