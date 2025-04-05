#!/usr/bin/env node

import { Command } from 'commander';
import { execCommand } from './commands.js';
import { createTerminalChatbot } from './index.js';
import { LogLevel } from './utils/logger.js';

/**
 * Parse command line arguments and execute the appropriate command
 * or launch the persistent chat interface if no arguments are provided
 */
function main(): void {
  const program = new Command();

  program
    .name('kota')
    .description('Command line interface for KOTA AI')
    .version('1.0.0')
    .option('-d, --debug', 'Enable debug output');

  // Default command - interactive chat interface
  program
    .action((options) => {
      // If other arguments are provided, handle them as commands
      if (program.args.length > 0) {
        execCommand(program.args).catch(handleError);
      } else {
        // Otherwise launch the interactive chat interface
        const { terminal } = createTerminalChatbot({
          logLevel: options.debug ? LogLevel.DEBUG : LogLevel.INFO,
          systemMessage: 'You are KOTA, a Knowledge Oriented Thinking Assistant. You provide helpful, accurate, and concise answers.',
        });
        
        terminal.start();
      }
    });

  // Add MCP-specific commands
  program
    .command('mcp')
    .description('Manage MCP servers')
    .argument('[cmd]', 'MCP command: connect, disconnect, list, add, remove, default, status')
    .argument('[args...]', 'Command arguments')
    .action((cmd, args) => {
      execCommand(['mcp', cmd, ...args]).catch(handleError);
    });

  // Handle errors
  function handleError(error: unknown): void {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }

  program.parse(process.argv);
}

// Run the main function
main();
