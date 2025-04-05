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
  importMCPServers,
} from './mcp/commands.js';
import {
  chatWithModel,
  listModels,
  setActiveModel,
  getActiveModel,
} from './model-commands.js';
import { createDefaultConfigFile } from './config.js';

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
  console.log('╭─────────────────────────────────────────────────────────╮');
  console.log('│                  KOTA - Command Help                    │');
  console.log('│        Knowledge Oriented Thinking Assistant            │');
  console.log('╰─────────────────────────────────────────────────────────╯');
  console.log('\nUsage: kota <command> [options]');
  
  // Basic Commands
  console.log('\n🔹 BASIC COMMANDS:');
  console.log('  init                     Initialize KOTA directories');
  console.log('  chat <message>           Start a chat with KOTA AI');
  console.log('  help                     Show this help information');
  
  // Model Commands
  console.log('\n🔹 MODEL COMMANDS:');
  console.log('  model list               List all available AI models');
  console.log('  model use <model-id>     Set the active AI model');
  console.log('    Example: kota model use claude-3-sonnet-20240229');
  console.log('    Example: kota model use llama3:latest');
  
  // Config Commands
  console.log('\n🔹 CONFIGURATION COMMANDS:');
  console.log('  config create [--format yaml|json]   Create a default chat configuration file');
  console.log('    Example: kota config create --format json');
  
  // MCP Commands
  console.log('\n🔹 MCP (MODEL CONTEXT PROTOCOL) COMMANDS:');
  console.log('  mcp connect [name]       Connect to an MCP server by name');
  console.log('    Example: kota mcp connect my-server');
  console.log('    Note: If no name is provided, connects to the default server');
  
  console.log('  mcp disconnect           Disconnect from the current MCP server');
  
  console.log('  mcp status               Show the status of the current MCP connection');
  console.log('    Note: Displays server info and capabilities when connected');
  
  console.log('  mcp list                 List all configured MCP servers');
  
  console.log('  mcp add <name> <type> [options]  Add a new MCP server configuration');
  console.log('    Types: stdio, http');
  console.log('    Options for stdio: --command=<cmd> [--args=<comma-separated-args>]');
  console.log('    Options for http: --url=<url> [--api-key=<api-key>]');
  console.log('    Common options: [--display-name=<name>] [--desc=<description>] [--default]');
  console.log('    Example: kota mcp add local-server stdio --command=path/to/server --default');
  console.log('    Example: kota mcp add cloud-api http --url=https://api.example.com --api-key=xyz');
  
  console.log('  mcp remove <name>        Remove an MCP server configuration');
  console.log('    Example: kota mcp remove my-server');
  
  console.log('  mcp default <name>       Set the default MCP server');
  console.log('    Example: kota mcp default my-server');
  
  console.log('  mcp import <file-path> [--force]  Import MCP server configs from file');
  console.log('    Supported formats: JSON and YAML');
  console.log('    Example: kota mcp import ./servers.json');
  console.log('    Example: kota mcp import ./servers.yaml --force');
  
  // Tips and help
  console.log('\n🔹 TIPS:');
  console.log('  • Use the persistent chat interface for a better experience:');
  console.log('    $ kota chat');
  console.log('  • Models can be changed within the persistent chat using Ctrl+M');
  console.log('  • Set your ANTHROPIC_API_KEY environment variable to use Claude models');
  console.log('  • MCP servers allow KOTA to utilize external context');
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
    case 'config':
      handleConfigCommands(commandArgs);
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
    console.error('Please specify a model command: list, use');
    return;
  }

  const subCommand = args[0];
  const subCommandArgs = args.slice(1);

  switch (subCommand) {
    case 'list':
      await listModels();
      break;
    case 'use':
      if (args.length < 2) {
        console.error('Please provide a model ID');
        console.log('Use \"kota model list\" to see available models');
        return;
      }

      const modelId = args[1];
      if (setActiveModel(modelId)) {
        const model = getActiveModel();
        console.log(`Active model set to ${model.id} (${model.name})`);
      } else {
        console.error(`Model with ID \"${modelId}\" not found`);
        console.log('Use \"kota model list\" to see available models');
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
      'Please specify an MCP command: connect, disconnect, status, list, add, remove, default, or import'
    );
    return;
  }

  const subCommand = args[0];
  const subCommandArgs = args.slice(1);

  switch (subCommand) {
    case 'connect': {
      if (subCommandArgs.length === 0) {
        await connectMCPServer([]);  // Connect to default server
      } else {
        await connectMCPServer(subCommandArgs);
      }
      break;
    }

    case 'disconnect': {
      await disconnectMCPServer();
      break;
    }

    case 'status': {
      showMCPStatus();
      break;
    }

    case 'list': {
      listMCPServers();
      break;
    }

    case 'add': {
      addMCPServer(subCommandArgs);
      break;
    }

    case 'remove': {
      removeMCPServer(subCommandArgs);
      break;
    }

    case 'default': {
      setDefaultMCPServer(subCommandArgs);
      break;
    }

    case 'import': {
      await importMCPServers(subCommandArgs);
      break;
    }

    default: {
      // Get instance just for backward compatibility with direct MCP server path
      const mcpManager = MCPManager.getInstance();
      
      try {
        // Assume the first argument is a direct path to an MCP server
        const mcpPath = args[0];
        const result = await mcpManager.connect(mcpPath);
        console.log(result);
      } catch (error) {
        console.error(
          `Unknown MCP command: ${subCommand}. Valid options are: connect, disconnect, status, list, add, remove, default, import`
        );
      }
    }
  }
}

/**
 * Handle configuration-related commands
 * @param args Command arguments
 */
function handleConfigCommands(args: string[]): void {
  if (args.length === 0) {
    console.error('Please specify a config command: create');
    return;
  }

  const subCommand = args[0];

  switch (subCommand) {
    case 'create': {
      let format: 'yaml' | 'json' = 'yaml'; // Default to YAML

      // Check if format is specified
      if (args.includes('--format')) {
        const formatIndex = args.indexOf('--format');
        if (formatIndex + 1 < args.length) {
          const specifiedFormat = args[formatIndex + 1].toLowerCase();
          if (specifiedFormat === 'json') {
            format = 'json';
          } else if (specifiedFormat !== 'yaml') {
            console.error('Invalid format specified. Using default (yaml).');
          }
        }
      }

      try {
        const configPath = createDefaultConfigFile(format);
        console.log(`Created default chat configuration at: ${configPath}`);
      } catch (error) {
        console.error('Failed to create configuration file:', error);
      }
      break;
    }

    default:
      console.error(
        `Unknown config command: ${subCommand}. Valid options are: create`
      );
  }
}
