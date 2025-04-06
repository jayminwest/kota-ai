// Enhanced MCP commands implementation
import {
  MCPServerConfig,
  MCPTransportType,
  MCPStdioConnection,
  MCPHttpConnection,
} from '../types/mcp.js';
import { MCPClient } from './client.js';
import { ServerCapabilities, SupportedModel } from './sdk-mock.js';
import { importMCPServers as importMCPServersFromFile } from './import.js';

// Re-export the import function
export { importMCPServersFromFile as importMCPServers };

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
      `✅ Connected to MCP server: ${currentServer?.displayName || currentServer?.name}`
    );

    // Display server capabilities
    console.log('\nServer capabilities:');
    console.log(`• Protocol version: ${capabilities.version}`);
    console.log(`• Name: ${capabilities.serverInfo?.name || 'Unknown'}`);
    console.log(`• Version: ${capabilities.serverInfo?.version || 'Unknown'}`);

    if (
      capabilities.supportedFeatures &&
      capabilities.supportedFeatures.length > 0
    ) {
      console.log('• Supported features:');
      capabilities.supportedFeatures.forEach((feature: string) => {
        console.log(`  - ${feature}`);
      });
    }

    if (
      capabilities.supportedModels &&
      capabilities.supportedModels.length > 0
    ) {
      console.log('• Supported models:');
      capabilities.supportedModels.forEach((model: SupportedModel) => {
        console.log(`  - ${model.id} (${model.name || 'Unnamed'})`);
      });
    }
    
    console.log('\nYou can now use the chat interface with MCP context support!');
    console.log('To start chatting with KOTA, run: kota chat');
  } catch (error) {
    console.error('❌ Connection error:', error instanceof Error ? error.message : String(error));
    
    if (!serverName) {
      console.log('\nTips:');
      console.log('• Make sure you have at least one MCP server configured');
      console.log('• To list available servers: kota mcp list');
      console.log('• To add a new server: kota mcp add <name> <type> [options]');
      console.log('• To view help: kota help');
    } else {
      console.log(`\nFailed to connect to server "${serverName}". Please ensure:`);
      console.log('• The server name is correct and exists in your configuration');
      console.log('• The server is currently running and accessible');
      console.log('• To list available servers: kota mcp list');
    }
  }
}

/**
 * Disconnect from the current MCP server
 */
export async function disconnectMCPServer(): Promise<void> {
  try {
    if (!mcpClient.isConnected()) {
      console.log('ℹ️ Not connected to any MCP server');
      return;
    }

    const currentServer = mcpClient.getCurrentServer();
    await mcpClient.disconnect();
    console.log(
      `✅ Disconnected from MCP server: ${currentServer?.displayName || currentServer?.name}`
    );
  } catch (error) {
    console.error(
      `❌ Error disconnecting: ${error instanceof Error ? error.message : String(error)}`
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
    console.log('\nExample: kota mcp add local-server stdio --command=path/to/server --default');
    return;
  }

  console.log('📋 Configured MCP servers:');

  servers.forEach((server: MCPServerConfig) => {
    const isConnected = currentServer?.name === server.name;
    const isDefault = server.isDefault ? ' (default)' : '';
    const lastUsed = server.lastUsed
      ? ` • Last used: ${new Date(server.lastUsed).toLocaleDateString()}`
      : ' • Never used';

    console.log(
      `${isConnected ? '🟢' : '⚪'} ${server.name}${isDefault}${isConnected ? ' [connected]' : ''}`
    );
    if (server.displayName) {
      console.log(`  • Display name: ${server.displayName}`);
    }
    if (server.description) {
      console.log(`  • Description: ${server.description}`);
    }
    console.log(`  • Transport: ${server.transportType}${lastUsed}`);
    
    // Show connection details
    if (server.transportType === MCPTransportType.STDIO) {
      const stdioCfg = server.connection as MCPStdioConnection;
      console.log(`  • Command: ${stdioCfg.command}`);
      if (stdioCfg.args && stdioCfg.args.length > 0) {
        console.log(`  • Arguments: ${stdioCfg.args.join(', ')}`);
      }
    } else if (server.transportType === MCPTransportType.HTTP) {
      const httpCfg = server.connection as MCPHttpConnection;
      console.log(`  • URL: ${httpCfg.url}`);
      if (httpCfg.apiKey) {
        console.log(`  • API Key: ${httpCfg.apiKey.substring(0, 3)}...`);
      }
    }
    console.log(''); // Add spacing between servers
  });
  
  console.log('To connect to a server: kota mcp connect <server-name>');
  console.log('To set a default server: kota mcp default <server-name>');
}

/**
 * Add a new MCP server configuration
 *
 * @param args - Command arguments
 */
export function addMCPServer(args: string[]): void {
  if (args.length < 2) {
    console.log('📝 Usage: kota mcp add <name> <type> [options]');
    console.log('\nTypes:');
    console.log('  • stdio - For local servers using standard input/output');
    console.log('  • http  - For remote servers using HTTP');
    
    console.log('\nOptions for stdio:');
    console.log('  --command=<command>        Command to start the MCP server (required)');
    console.log('  --args=<comma-separated>   Command arguments (optional)');
    console.log('  --cwd=<directory>          Working directory (optional)');
    
    console.log('\nOptions for http:');
    console.log('  --url=<url>                Server URL (required)');
    console.log('  --api-key=<api-key>        API key for authentication (optional)');
    
    console.log('\nCommon options:');
    console.log('  --display-name=<name>      Human-readable name (optional)');
    console.log('  --desc=<description>       Server description (optional)');
    console.log('  --default                  Set as default server (optional)');
    
    console.log('\nExamples:');
    console.log('  kota mcp add local-server stdio --command=./mcp-server.js --default');
    console.log('  kota mcp add cloud-api http --url=https://api.example.com/mcp --api-key=xyz123');
    return;
  }

  const name = args[0];
  const type = args[1].toLowerCase();

  if (!name.match(/^[a-zA-Z0-9-_]+$/)) {
    console.error(
      '❌ Error: Server name must only contain letters, numbers, hyphens, and underscores'
    );
    return;
  }

  // Check if name already exists
  if (mcpClient.getServerByName(name)) {
    console.error(`❌ Error: Server with name "${name}" already exists`);
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
      `❌ Error: Unsupported transport type "${type}". Use "stdio" or "http"`
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
      console.error(`❌ Error: Invalid option format "${arg}"`);
      return;
    }

    const [, key, value] = match;
    options[key] = value;
  }

  try {
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
    console.log(`✅ Added MCP server "${name}"`);

    if (isDefault) {
      console.log(`✅ Set "${name}" as the default MCP server`);
    }
    
    console.log('\nNext steps:');
    console.log(`• Connect to the server: kota mcp connect ${name}`);
    console.log('• Start chatting with context: kota chat');
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
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
    console.log('Example: kota mcp remove my-server');
    return;
  }

  const name = args[0];

  // Check if we're currently connected to this server
  const currentServer = mcpClient.getCurrentServer();
  if (currentServer?.name === name) {
    console.error(
      `❌ Cannot remove server "${name}" while connected to it. Disconnect first.`
    );
    console.log('To disconnect: kota mcp disconnect');
    return;
  }

  if (mcpClient.removeServer(name)) {
    console.log(`✅ Removed MCP server "${name}"`);
  } else {
    console.error(`❌ Server "${name}" not found`);
    console.log('To list available servers: kota mcp list');
  }
}

/**
 * Set the default MCP server
 */
export function setDefaultMCPServer(args: string[]): void {
  if (args.length < 1) {
    console.log('Usage: kota mcp default <name>');
    console.log('Example: kota mcp default my-server');
    return;
  }

  const name = args[0];

  if (mcpClient.setDefaultServer(name)) {
    console.log(`✅ Set "${name}" as the default MCP server`);
    console.log('This server will be used when connecting without specifying a name');
    console.log('To connect to the default server: kota mcp connect');
  } else {
    console.error(`❌ Server "${name}" not found`);
    console.log('To list available servers: kota mcp list');
  }
}

/**
 * Show the status of the current MCP connection
 */
export function showMCPStatus(): void {
  if (!mcpClient.isConnected()) {
    console.log('ℹ️ Not connected to any MCP server');
    console.log('\nTo connect to an MCP server:');
    console.log('• kota mcp connect [server-name]');
    console.log('\nTo list available servers:');
    console.log('• kota mcp list');
    return;
  }

  const currentServer = mcpClient.getCurrentServer();
  const capabilities = mcpClient.getServerCapabilities();

  console.log(
    `🟢 Connected to MCP server: ${currentServer?.displayName || currentServer?.name}`
  );

  if (capabilities) {
    console.log('\nServer capabilities:');
    console.log(`• Protocol version: ${capabilities.version}`);
    console.log(`• Name: ${capabilities.serverInfo?.name || 'Unknown'}`);
    console.log(`• Version: ${capabilities.serverInfo?.version || 'Unknown'}`);

    if (
      capabilities.supportedFeatures &&
      capabilities.supportedFeatures.length > 0
    ) {
      console.log('\n• Supported features:');
      capabilities.supportedFeatures.forEach((feature: string) => {
        console.log(`  - ${feature}`);
      });
    }

    if (
      capabilities.supportedModels &&
      capabilities.supportedModels.length > 0
    ) {
      console.log('\n• Supported models:');
      capabilities.supportedModels.forEach((model: SupportedModel) => {
        console.log(`  - ${model.id} (${model.name || 'Unnamed'})`);
      });
    }
  }
  
  console.log('\nYou can now use KOTA with MCP context support!');
  console.log('• To start chatting: kota chat');
  console.log('• To disconnect: kota mcp disconnect');
}
