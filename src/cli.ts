#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { mcpClient, MCPClientEvent } from './mcp/client';
import { mcpServerManager } from './mcp/server-manager';
import { MCPServerConfig } from './types/mcp';

const KOTA_DIR_NAME = '.kota-ai';
const NOTES_DIR_NAME = 'notes';

function getKotaDir(): string {
  return path.join(os.homedir(), KOTA_DIR_NAME);
}

function getNotesDir(): string {
  return path.join(getKotaDir(), NOTES_DIR_NAME);
}

function initializeKota(): void {
  const kotaDir = getKotaDir();
  const notesDir = getNotesDir();

  console.log(`Initializing KOTA in ${kotaDir}...`);

  try {
    if (!fs.existsSync(kotaDir)) {
      fs.mkdirSync(kotaDir);
      console.log(`Created KOTA directory: ${kotaDir}`);
    } else {
      console.log(`KOTA directory already exists: ${kotaDir}`);
    }

    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir);
      console.log(`Created notes directory: ${notesDir}`);
    } else {
      console.log(`Notes directory already exists: ${notesDir}`);
    }

    console.log('KOTA initialized successfully.');

  } catch (error) {
    console.error('Failed to initialize KOTA:', error);
    process.exit(1); // Exit with error code
  }
}

/**
 * Connect to an MCP server by ID
 */
async function connectToServer(serverId: string): Promise<void> {
  const serverConfig = mcpServerManager.getServer(serverId);
  
  if (!serverConfig) {
    console.error(`Server with ID '${serverId}' not found.`);
    console.log('Available servers:');
    listServers();
    process.exit(1);
  }

  console.log(`Connecting to MCP server: ${serverConfig.name} (${serverId})...`);
  
  // Setup event handlers
  mcpClient.on(MCPClientEvent.CONNECTED, () => {
    console.log(`Connected to MCP server: ${serverConfig.name} (${serverId})`);
    // Update last used timestamp
    mcpServerManager.updateLastUsed(serverId);
  });

  mcpClient.on(MCPClientEvent.DISCONNECTED, () => {
    console.log(`Disconnected from MCP server: ${serverConfig.name} (${serverId})`);
  });

  mcpClient.on(MCPClientEvent.ERROR, (event) => {
    console.error(`Error with MCP server ${serverId}:`, event.error);
  });

  try {
    await mcpClient.connect(serverConfig);
    // Keep the process running to maintain the connection
    console.log('Press Ctrl+C to disconnect and exit.');
  } catch (error) {
    console.error('Failed to connect to the MCP server:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from the current MCP server
 */
async function disconnectFromServer(): Promise<void> {
  const currentServer = mcpClient.getCurrentConfig();
  
  if (!currentServer) {
    console.log('Not currently connected to any MCP server.');
    return;
  }

  console.log(`Disconnecting from MCP server: ${currentServer.name} (${currentServer.id})...`);
  
  try {
    await mcpClient.disconnect();
    console.log('Disconnected successfully.');
  } catch (error) {
    console.error('Error disconnecting from the MCP server:', error);
    process.exit(1);
  }
}

/**
 * List all configured MCP servers
 */
function listServers(): void {
  const servers = mcpServerManager.listServers();
  
  if (servers.length === 0) {
    console.log('No MCP servers configured. Use `kota server add` to add a server.');
    return;
  }

  console.log('Configured MCP servers:');
  servers.forEach(server => {
    const lastUsed = server.lastUsed 
      ? `Last used: ${server.lastUsed.toLocaleString()}`
      : 'Never used';
    
    console.log(`- ${server.name} (${server.id})`);
    console.log(`  Transport: ${server.transport}, Endpoint: ${server.endpoint}`);
    console.log(`  ${lastUsed}`);
    console.log();
  });
}

/**
 * Add a new MCP server configuration
 */
function addServer(args: string[]): void {
  if (args.length < 3) {
    console.log('Usage: kota server add <id> <name> <transport> <endpoint> [options]');
    console.log('Example: kota server add local-llm "Local LLM" stdio "/path/to/llm"');
    console.log('Example: kota server add api-server "API Server" http "http://localhost:3000/mcp"');
    return;
  }

  const [id, name, transport, endpoint, ...options] = args;

  if (transport !== 'stdio' && transport !== 'http') {
    console.error('Transport must be either "stdio" or "http"');
    return;
  }

  const serverConfig: MCPServerConfig = {
    id,
    name,
    transport: transport as 'stdio' | 'http',
    endpoint,
    options: {}
  };

  // Parse additional options if provided
  if (options.length > 0) {
    try {
      serverConfig.options = JSON.parse(options.join(' '));
    } catch (error) {
      console.error('Failed to parse options as JSON:', error);
      return;
    }
  }

  mcpServerManager.addServer(serverConfig);
  console.log(`Added MCP server: ${name} (${id})`);
}

/**
 * Remove an MCP server configuration
 */
function removeServer(serverId: string): void {
  if (!serverId) {
    console.log('Usage: kota server remove <id>');
    return;
  }

  const result = mcpServerManager.removeServer(serverId);
  
  if (result) {
    console.log(`Removed MCP server with ID: ${serverId}`);
  } else {
    console.error(`Server with ID '${serverId}' not found.`);
  }
}

/**
 * Handle server management commands
 */
function handleServerCommand(args: string[]): void {
  if (args.length === 0) {
    console.log('Usage: kota server <command>');
    console.log('Available commands: list, add, remove');
    return;
  }

  const subCommand = args[0];
  const subCommandArgs = args.slice(1);

  switch (subCommand) {
    case 'list':
      listServers();
      break;
    case 'add':
      addServer(subCommandArgs);
      break;
    case 'remove':
      removeServer(subCommandArgs[0]);
      break;
    default:
      console.error(`Unknown server command: ${subCommand}`);
      console.log('Available commands: list, add, remove');
  }
}

async function main(): Promise<void> {
  // Basic argument parsing
  const args = process.argv.slice(2); // Skip 'node' and script path

  if (args.length === 0) {
    console.log('Usage: kota <command>');
    console.log('Available commands: init, connect, disconnect, server');
    process.exit(1);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'init':
      initializeKota();
      break;
    case 'connect':
      if (commandArgs.length === 0) {
        console.log('Usage: kota connect <server-id>');
        console.log('Available servers:');
        listServers();
      } else {
        await connectToServer(commandArgs[0]);
      }
      break;
    case 'disconnect':
      await disconnectFromServer();
      break;
    case 'server':
      handleServerCommand(commandArgs);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Available commands: init, connect, disconnect, server');
      process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
