import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { MCPClient } from './client.js';
import { MCPServerConfig, MCPTransportType } from '../types/mcp.js';

// Create a singleton instance of the MCP client
const mcpClient = new MCPClient();

/**
 * Interface for MCP server import configuration file
 */
interface MCPImportConfig {
  servers: MCPServerConfig[];
}

/**
 * Schema validation for MCP import configuration
 * @param data The imported data to validate
 * @returns An object with validation result and optional error message
 */
function validateImportConfig(data: any): { valid: boolean; error?: string } {
  // Check if data has servers property and it's an array
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Import data must be an object' };
  }

  if (!Array.isArray(data.servers)) {
    return { valid: false, error: 'Import data must contain a servers array' };
  }

  // Validate each server configuration
  for (let i = 0; i < data.servers.length; i++) {
    const server = data.servers[i];

    // Check required fields
    if (!server.name) {
      return {
        valid: false,
        error: `Server at index ${i} is missing required 'name' field`,
      };
    }

    // Validate server name format
    if (!server.name.match(/^[a-zA-Z0-9-_]+$/)) {
      return {
        valid: false,
        error: `Server '${server.name}' has invalid name format. Names must only contain letters, numbers, hyphens, and underscores`,
      };
    }

    if (!server.transportType) {
      return {
        valid: false,
        error: `Server '${server.name}' is missing required 'transportType' field`,
      };
    }

    // Validate transport type
    if (server.transportType !== 'stdio' && server.transportType !== 'http') {
      return {
        valid: false,
        error: `Server '${server.name}' has invalid transportType. Must be 'stdio' or 'http'`,
      };
    }

    // Validate connection based on transport type
    if (!server.connection || typeof server.connection !== 'object') {
      return {
        valid: false,
        error: `Server '${server.name}' is missing or has invalid 'connection' object`,
      };
    }

    if (server.transportType === 'stdio') {
      if (!server.connection.command) {
        return {
          valid: false,
          error: `Server '${server.name}' with stdio transport is missing required 'command' in connection`,
        };
      }
    } else if (server.transportType === 'http') {
      if (!server.connection.url) {
        return {
          valid: false,
          error: `Server '${server.name}' with http transport is missing required 'url' in connection`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Import MCP server configurations from a JSON or YAML file
 *
 * @param args - Command arguments, first argument is the file path, optional --force flag
 */
export async function importMCPServers(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log('Usage: kota mcp import <file-path> [--force]');
    console.log('Supported file formats: JSON and YAML');
    console.log('Options:');
    console.log(
      '  --force  Overwrite existing server configurations without prompting'
    );
    return;
  }

  const filePath = args[0];
  const forceOverwrite = args.includes('--force');

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      return;
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse content based on file extension
    let importData: MCPImportConfig;
    const extension = path.extname(filePath).toLowerCase();

    if (extension === '.json') {
      try {
        importData = JSON.parse(fileContent) as MCPImportConfig;
      } catch (error) {
        console.error(
          `Error parsing JSON file: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
      }
    } else if (extension === '.yml' || extension === '.yaml') {
      try {
        importData = yaml.load(fileContent) as MCPImportConfig;
      } catch (error) {
        console.error(
          `Error parsing YAML file: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
      }
    } else {
      console.error(
        'Error: Unsupported file format. Please use JSON (.json) or YAML (.yml, .yaml) files.'
      );
      return;
    }

    // Validate the imported data
    const validation = validateImportConfig(importData);
    if (!validation.valid) {
      console.error(`Error validating import data: ${validation.error}`);
      return;
    }

    // Process server configurations
    const serversToImport = importData.servers;
    let imported = 0;
    let skipped = 0;
    let overwritten = 0;

    for (const serverConfig of serversToImport) {
      // Convert the string transport type to enum
      let mcpTransportType: MCPTransportType;

      if (serverConfig.transportType === 'stdio') {
        mcpTransportType = MCPTransportType.STDIO;
      } else if (serverConfig.transportType === 'http') {
        mcpTransportType = MCPTransportType.HTTP;
      } else {
        console.error(
          `Error: Invalid transport type "${serverConfig.transportType}" for server "${serverConfig.name}"`
        );
        skipped++;
        continue;
      }

      // Check if server with this name already exists
      const existingServer = mcpClient.getServerByName(serverConfig.name);

      if (existingServer && !forceOverwrite) {
        console.log(
          `Skipping server "${serverConfig.name}" - already exists. Use --force to overwrite.`
        );
        skipped++;
        continue;
      }

      // Create the final server config object
      const finalConfig: MCPServerConfig = {
        name: serverConfig.name,
        transportType: mcpTransportType,
        displayName: serverConfig.displayName,
        description: serverConfig.description,
        isDefault: serverConfig.isDefault,
        connection: serverConfig.connection,
      };

      // Add the server to the configuration
      mcpClient.addServer(finalConfig);

      if (existingServer) {
        console.log(`Overwritten existing server: "${serverConfig.name}"`);
        overwritten++;
      } else {
        console.log(`Imported new server: "${serverConfig.name}"`);
        imported++;
      }

      if (serverConfig.isDefault) {
        console.log(`Set "${serverConfig.name}" as the default MCP server`);
      }
    }

    console.log(
      `\nImport summary: ${imported + overwritten} servers imported (${imported} new, ${overwritten} overwritten), ${skipped} skipped.`
    );
  } catch (error) {
    console.error(
      `Error importing MCP server configurations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
