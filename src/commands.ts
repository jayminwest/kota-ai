import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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
import {
  chatWithModel,
  listModels,
  setActiveModel,
  getActiveModel,
} from './model-commands.js';

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

function showHelp(): void {
  console.log('Usage: kota <command>');
  console.log('\nAvailable commands:');
  console.log('  init                    Initialize KOTA directories');
  console.log('  chat <message>          Chat with KOTA AI');
  console.log('  model list              List available AI models');
  console.log('  model use <model-id>    Set the active AI model');
  console.log('  mcp connect <path>      Connect to MCP server');
  console.log('  mcp disconnect          Disconnect from MCP server');
  console.log('  mcp status              Check MCP connection status');
  console.log('  help                    Show this help information');
  console.log('\nMCP Commands:');
  console.log('  mcp connect [name]      Connect to an MCP server');
  console.log(
    '  mcp disconnect          Disconnect from the current MCP server'
  );
  console.log('  mcp list                List available MCP servers');
  console.log('  mcp add <n> <type>   Add a new MCP server configuration');
  console.log('  mcp remove <n>       Remove an MCP server configuration');
  console.log('  mcp default <n>      Set the default MCP server');
  console.log(
    '  mcp status              Show the status of the current MCP connection'
  );
  console.log('\nModel Commands:');
  console.log('  model list              List available AI models');
  console.log('  model use <model-id>    Set the active AI model');
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
      // Use the model-commands chatWithModel function
      await chatWithModel(commandArgs.join(' '));
      break;
    case 'model':
      await handleModelCommands(commandArgs);
      break;
    case 'mcp':
      await handleMCPCommands(commandArgs);
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
  }
}

/**
 * Handle model-related commands
 * @param args Command arguments
 */
async function handleModelCommands(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error(
      'Please specify a model command: list, use'
    );
    return;
  }

  const subCommand = args[0];

  switch (subCommand) {
    case 'list':
      await listModels();
      break;
    case 'use':
      if (args.length < 2) {
        console.error('Please provide a model ID');
        console.log('Use "kota model list" to see available models');
        return;
      }

      const modelId = args[1];
      if (setActiveModel(modelId)) {
        const model = getActiveModel();
        console.log(`Active model set to ${model.id} (${model.name})`);
      } else {
        console.error(`Model with ID "${modelId}" not found`);
        console.log('Use "kota model list" to see available models');
      }
      break;
    default:
      console.error(
        `Unknown model command: ${subCommand}. Valid options are: list, use`
      );
  }
}

/**
 * Handle MCP-related commands
 * @param args Command arguments
 */
async function handleMCPCommands(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error(
      'Please specify an MCP command: connect, disconnect, list, add, remove, default, status'
    );
    return;
  }

  const subCommand = args[0];
  const mcpArgs = args.slice(1);

  switch (subCommand) {
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
      console.error(`Unknown MCP subcommand: ${subCommand}`);
      console.log(
        'Available MCP subcommands: connect, disconnect, list, add, remove, default, status'
      );
  }
}
