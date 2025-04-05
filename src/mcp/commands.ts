import {
  MCPServerConfig,
  MCPTransportType,
  MCPStdioConnection,
  MCPHttpConnection,
} from '../types/mcp.js';
import { MCPClient } from './client.js';
import { ServerCapabilities, SupportedModel } from './sdk-mock.js';

// Create a singleton instance of the MCP client
const mcpClient = new MCPClient();

/**
 * Connect to an MCP server
 *
 * @param args - Command arguments, first argument is the server name
 */
export async function connectMCPServer(args: string[]): Promise<void> {
  const serverName = args[0];

  try {
    // If no server name is provided, connect to the default server
    const capabilities = await mcpClient.connect(serverName);

    const currentServer = mcpClient.getCurrentServer();
    console.log(
      `Connected to MCP server: ${currentServer?.displayName || currentServer?.name}`
    );

    // Display server capabilities
    console.log('\nServer capabilities:');
    console.log(`- Protocol version: ${capabilities.version}`);
    console.log(`- Name: ${capabilities.serverInfo?.name || 'Unknown'}`);
    console.log(`- Version: ${capabilities.serverInfo?.version || 'Unknown'}`);

    if (
      capabilities.supportedFeatures &&
      capabilities.supportedFeatures.length > 0
    ) {
      console.log('- Supported features:');
      capabilities.supportedFeatures.forEach((feature: string) => {
        console.log(`  - ${feature}`);
      });
    }

    if (
      capabilities.supportedModels &&
      capabilities.supportedModels.length > 0
    ) {
      console.log('- Supported models:');
      capabilities.supportedModels.forEach((model: SupportedModel) => {
        console.log(`  - ${model.id} (${model.name || 'Unnamed'})`);
      });
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Disconnect from the current MCP server
 */
export async function disconnectMCPServer(): Promise<void> {
  try {
    if (!mcpClient.isConnected()) {
      console.log('Not connected to any MCP server');
      return;
    }

    const currentServer = mcpClient.getCurrentServer();
    await mcpClient.disconnect();
    console.log(
      `Disconnected from MCP server: ${currentServer?.displayName || currentServer?.name}`
    );
  } catch (error) {
    console.error(
      `Error disconnecting: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * List available MCP servers
 */
export function listMCPServers(): void {
  const servers = mcpClient.getServers();
  const currentServer = mcpClient.getCurrentServer();

  if (servers.length === 0) {
    console.log(
      'No MCP servers configured. Use "kota mcp add" to add a server.'
    );
    return;
  }

  console.log('Configured MCP servers:');

  servers.forEach((server: MCPServerConfig) => {
    const isConnected = currentServer?.name === server.name;
    const isDefault = server.isDefault ? ' (default)' : '';
    const lastUsed = server.lastUsed
      ? ` - Last used: ${new Date(server.lastUsed).toLocaleDateString()}`
      : ' - Never used';

    console.log(
      `- ${server.name}${isDefault}${isConnected ? ' [connected]' : ''}`
    );
    if (server.displayName) {
      console.log(`  Display name: ${server.displayName}`);
    }
    if (server.description) {
      console.log(`  Description: ${server.description}`);
    }
    console.log(`  Transport: ${server.transportType}${lastUsed}`);
  });
}

/**
 * Add a new MCP server configuration
 *
 * @param args - Command arguments
 */
export function addMCPServer(args: string[]): void {
  if (args.length < 2) {
    console.log('Usage: kota mcp add <name> <type> [options]');
    console.log('Types: stdio, http');
    console.log(
      'Options for stdio: --command=<command> [--args=<comma-separated-args>]'
    );
    console.log('Options for http: --url=<url> [--api-key=<api-key>]');
    console.log(
      'Common options: [--display-name=<display name>] [--desc=<description>] [--default]'
    );
    return;
  }

  const name = args[0];
  const type = args[1].toLowerCase();

  if (!name.match(/^[a-zA-Z0-9-_]+$/)) {
    console.error(
      'Error: Server name must only contain letters, numbers, hyphens, and underscores'
    );
    return;
  }

  // Check if name already exists
  if (mcpClient.getServerByName(name)) {
    console.error(`Error: Server with name "${name}" already exists`);
    return;
  }

  // Parse the transport type
  let transportType: MCPTransportType;
  if (type === 'stdio') {
    transportType = MCPTransportType.STDIO;
  } else if (type === 'http') {
    transportType = MCPTransportType.HTTP;
  } else {
    console.error(
      `Error: Unsupported transport type "${type}". Use "stdio" or "http"`
    );
    return;
  }

  // Parse the remaining arguments as options
  const options: Record<string, string> = {};
  let isDefault = false;

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--default') {
      isDefault = true;
      continue;
    }

    const match = arg.match(/^--([a-zA-Z0-9-]+)=(.*)$/);
    if (!match) {
      console.error(`Error: Invalid option format "${arg}"`);
      return;
    }

    const [, key, value] = match;
    options[key] = value;
  }

  // Create the server configuration
  const serverConfig: MCPServerConfig = {
    name,
    transportType,
    displayName: options['display-name'],
    description: options['desc'],
    isDefault,
    connection: createConnectionConfig(transportType, options),
  };

  // Add the server
  mcpClient.addServer(serverConfig);
  console.log(`Added MCP server "${name}"`);

  if (isDefault) {
    console.log(`Set "${name}" as the default MCP server`);
  }
}

/**
 * Create a connection configuration based on transport type and options
 */
function createConnectionConfig(
  transportType: MCPTransportType,
  options: Record<string, string>
): MCPStdioConnection | MCPHttpConnection {
  if (transportType === MCPTransportType.STDIO) {
    const command = options['command'];
    if (!command) {
      throw new Error('Missing required option --command for stdio transport');
    }

    const stdioConnection: MCPStdioConnection = { command };

    if (options['args']) {
      stdioConnection.args = options['args'].split(',');
    }

    if (options['cwd']) {
      stdioConnection.cwd = options['cwd'];
    }

    return stdioConnection;
  } else if (transportType === MCPTransportType.HTTP) {
    const url = options['url'];
    if (!url) {
      throw new Error('Missing required option --url for http transport');
    }

    const httpConnection: MCPHttpConnection = { url };

    if (options['api-key']) {
      httpConnection.apiKey = options['api-key'];
    }

    return httpConnection;
  }

  throw new Error(`Unsupported transport type: ${transportType}`);
}

/**
 * Remove an MCP server configuration
 */
export function removeMCPServer(args: string[]): void {
  if (args.length < 1) {
    console.log('Usage: kota mcp remove <name>');
    return;
  }

  const name = args[0];

  // Check if we're currently connected to this server
  const currentServer = mcpClient.getCurrentServer();
  if (currentServer?.name === name) {
    console.error(
      `Cannot remove server "${name}" while connected to it. Disconnect first.`
    );
    return;
  }

  if (mcpClient.removeServer(name)) {
    console.log(`Removed MCP server "${name}"`);
  } else {
    console.error(`Server "${name}" not found`);
  }
}

/**
 * Set the default MCP server
 */
export function setDefaultMCPServer(args: string[]): void {
  if (args.length < 1) {
    console.log('Usage: kota mcp default <name>');
    return;
  }

  const name = args[0];

  if (mcpClient.setDefaultServer(name)) {
    console.log(`Set "${name}" as the default MCP server`);
  } else {
    console.error(`Server "${name}" not found`);
  }
}

/**
 * Show the status of the current MCP connection
 */
export function showMCPStatus(): void {
  if (!mcpClient.isConnected()) {
    console.log('Not connected to any MCP server');
    return;
  }

  const currentServer = mcpClient.getCurrentServer();
  const capabilities = mcpClient.getServerCapabilities();

  console.log(
    `Connected to MCP server: ${currentServer?.displayName || currentServer?.name}`
  );

  if (capabilities) {
    console.log('\nServer capabilities:');
    console.log(`- Protocol version: ${capabilities.version}`);
    console.log(`- Name: ${capabilities.serverInfo?.name || 'Unknown'}`);
    console.log(`- Version: ${capabilities.serverInfo?.version || 'Unknown'}`);

    if (
      capabilities.supportedFeatures &&
      capabilities.supportedFeatures.length > 0
    ) {
      console.log('- Supported features:');
      capabilities.supportedFeatures.forEach((feature: string) => {
        console.log(`  - ${feature}`);
      });
    }

    if (
      capabilities.supportedModels &&
      capabilities.supportedModels.length > 0
    ) {
      console.log('- Supported models:');
      capabilities.supportedModels.forEach((model: SupportedModel) => {
        console.log(`  - ${model.id} (${model.name || 'Unnamed'})`);
      });
    }
  }
}

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

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
        error: `Server at index ${i} is missing required 'name' field` 
      };
    }
    
    if (!server.transportType) {
      return { 
        valid: false, 
        error: `Server '${server.name}' is missing required 'transportType' field` 
      };
    }
    
    // Validate transport type
    if (server.transportType !== 'stdio' && server.transportType !== 'http') {
      return {
        valid: false,
        error: `Server '${server.name}' has invalid transportType. Must be 'stdio' or 'http'`
      };
    }
    
    // Validate connection based on transport type
    if (!server.connection || typeof server.connection !== 'object') {
      return {
        valid: false,
        error: `Server '${server.name}' is missing or has invalid 'connection' object`
      };
    }
    
    if (server.transportType === 'stdio') {
      if (!server.connection.command) {
        return {
          valid: false,
          error: `Server '${server.name}' with stdio transport is missing required 'command' in connection`
        };
      }
    } else if (server.transportType === 'http') {
      if (!server.connection.url) {
        return {
          valid: false,
          error: `Server '${server.name}' with http transport is missing required 'url' in connection`
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
export function importMCPServers(args: string[]): void {
  if (args.length < 1) {
    console.log('Usage: kota mcp import <file-path> [--force]');
    console.log('Supported file formats: JSON and YAML');
    console.log('Options:');
    console.log('  --force  Overwrite existing server configurations without prompting');
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
      importData = JSON.parse(fileContent) as MCPImportConfig;
    } else if (extension === '.yml' || extension === '.yaml') {
      importData = yaml.load(fileContent) as MCPImportConfig;
    } else {
      console.error('Error: Unsupported file format. Please use JSON or YAML files.');
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

    for (const serverConfig of serversToImport) {
      // Convert the transportType string to enum
      const transportType = serverConfig.transportType as keyof typeof MCPTransportType;
      
      // Check if server with this name already exists
      const existingServer = mcpClient.getServerByName(serverConfig.name);
      
      if (existingServer && !forceOverwrite) {
        console.log(`Skipping server "${serverConfig.name}" - already exists. Use --force to overwrite.`);
        skipped++;
        continue;
      }

      // Create the final server config object
      const finalConfig: MCPServerConfig = {
        name: serverConfig.name,
        transportType: MCPTransportType[transportType],
        displayName: serverConfig.displayName,
        description: serverConfig.description,
        isDefault: serverConfig.isDefault,
        connection: serverConfig.connection,
      };

      // Add the server to the configuration
      mcpClient.addServer(finalConfig);
      console.log(`Imported MCP server "${serverConfig.name}"`);
      
      if (serverConfig.isDefault) {
        console.log(`Set "${serverConfig.name}" as the default MCP server`);
      }
      
      imported++;
    }

    console.log(`\nImport summary: ${imported} servers imported, ${skipped} skipped.`);

  } catch (error) {
    console.error(`Error importing MCP server configurations: ${error instanceof Error ? error.message : String(error)}`);
  }
}
