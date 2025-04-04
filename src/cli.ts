#!/usr/bin/env node

import { Command } from 'commander';
import { execCommand } from './commands.js';
import { PersistentChatInterface } from './persistentChat.js';

/**
 * Parse command line arguments and execute the appropriate command
 * or launch the persistent chat interface if no arguments are provided
 */
function main(): void {
  const args = process.argv.slice(2); // Skip 'node' and script path

  // If no arguments provided, launch the persistent chat interface
  if (args.length === 0) {
    const chatInterface = new PersistentChatInterface();
    chatInterface.start();
    return;
  }

  // Otherwise, handle the command
  const program = new Command();

  program
    .name('kota')
    .description('Command line interface for KOTA AI')
    .version('1.0.0')
    .allowExcessArguments(true)
    .allowUnknownOption(true)
    .action(async () => {
      try {
        await execCommand(args);
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

// Run the main function
main();
