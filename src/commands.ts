import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { AnthropicService } from './anthropicService.js';
import { MCPManager } from './mcpManager.js';
import {
  connectMCPServer,
  disconnectMCPServer,
  listMCPServers,
  addMCPServer,
  removeMCPServer,
  setDefaultMCPServer,
  showMCPStatus,
} from './mcp/commands.js';

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
    throw error;
  }
}

async function chatWithAI(message: string): Promise<void> {
  try {
    const anthropicService = AnthropicService.getInstance();

    console.log('AI: Thinking...');

    // For non-streaming version, we'd use a callback to get the final response
    let responseAccumulator = '';

    await anthropicService.chatWithAI(
      message,
      (chunk) => {
        // In non-interactive mode, we accumulate the response but don't stream to console
        responseAccumulator += chunk;
      },
      () => {
        // Once complete, display the full response
        console.log(`AI: ${responseAccumulator}`);
      }
    );
  } catch (error) {
    console.error('Error communicating with AI:', error);
  }
}

function showHelp(): void {
  console.log('Usage: kota <command>');
  console.log('\nAvailable commands:');
  console.log('  init                    Initialize KOTA directories');
  console.log('  chat <message>          Chat with KOTA AI');
  console.log('  mcp connect <path>      Connect to MCP server');
  console.log('  mcp disconnect          Disconnect from MCP server');
  console.log('  mcp status              Check MCP connection status');
  console.log('  help                    Show this help information');
  console.log('  init           Initialize KOTA directories');
  console.log('  chat <message> Chat with KOTA AI');
  console.log('  help           Show this help information');
  console.log('\nMCP Commands:');
  console.log('  mcp connect [name]      Connect to an MCP server');
  console.log(
    '  mcp disconnect          Disconnect from the current MCP server'
  );
  console.log('  mcp list                List available MCP servers');
  console.log('  mcp add <name> <type>   Add a new MCP server configuration');
  console.log('  mcp remove <name>       Remove an MCP server configuration');
  console.log('  mcp default <name>      Set the default MCP server');
  console.log(
    '  mcp status              Show the status of the current MCP connection'
  );
}

/**
 * Execute a command with the given arguments
 *
 * @param args - The command and its arguments
 */
export async function execCommand(args: string[]): Promise<void> {
  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'init':
      initializeKota();
      break;
    case 'chat':
      if (commandArgs.length === 0) {
        console.error('Please provide a message to chat with the AI.');
        break;
      }
      await chatWithAI(commandArgs.join(' '));
      break;
    case 'mcp':
      await handleMCPCommands(commandArgs);
      break;
    case 'help':
      showHelp();
      break;
    case 'mcp':
      if (commandArgs.length === 0) {
        console.error('Please provide an MCP subcommand.');
        console.log(
          'Available MCP subcommands: connect, disconnect, list, add, remove, default, status'
        );
        break;
      }

      const mcpSubcommand = commandArgs[0];
      const mcpArgs = commandArgs.slice(1);

      switch (mcpSubcommand) {
        case 'connect':
          await connectMCPServer(mcpArgs);
          break;
        case 'disconnect':
          await disconnectMCPServer();
          break;
        case 'list':
          listMCPServers();
          break;
        case 'add':
          addMCPServer(mcpArgs);
          break;
        case 'remove':
          removeMCPServer(mcpArgs);
          break;
        case 'default':
          setDefaultMCPServer(mcpArgs);
          break;
        case 'status':
          showMCPStatus();
          break;
        default:
          console.error(`Unknown MCP subcommand: ${mcpSubcommand}`);
          console.log(
            'Available MCP subcommands: connect, disconnect, list, add, remove, default, status'
          );
      }
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
  }
}

/**
 * Handle MCP-related commands
 * @param args Command arguments
 */
async function handleMCPCommands(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error(
      'Please specify an MCP command: connect, disconnect, or status'
    );
    return;
  }

  const mcpManager = MCPManager.getInstance();
  const subCommand = args[0];

  switch (subCommand) {
    case 'connect': {
      if (args.length < 2) {
        console.error('Please provide a path to the MCP server');
        return;
      }
      try {
        const mcpPath = args[1];
        const result = await mcpManager.connect(mcpPath);
        console.log(result);
      } catch (error) {
        console.error(
          'Failed to connect to MCP server:',
          error instanceof Error ? error.message : String(error)
        );
      }
      break;
    }

    case 'disconnect': {
      const result = mcpManager.disconnect();
      console.log(result);
      break;
    }

    case 'status': {
      const isConnected = mcpManager.isConnectedToServer();
      console.log(
        isConnected ? 'MCP Status: Connected' : 'MCP Status: Not connected'
      );
      break;
    }

    default:
      console.error(
        `Unknown MCP command: ${subCommand}. Valid options are: connect, disconnect, status`
      );
  }
}
