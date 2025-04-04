import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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

function chatWithAI(message: string): void {
  console.log(`AI Response: I received your message: "${message}"`);
  // In a real implementation, this would call the AI model
}

function showHelp(): void {
  console.log('Usage: kota <command>');
  console.log('\nAvailable commands:');
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
      chatWithAI(commandArgs.join(' '));
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
