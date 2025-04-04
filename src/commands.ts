import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

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
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
  }
}
