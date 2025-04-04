#!/usr/bin/env node

import fs from 'node:fs'; // Use node: prefix for built-ins
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
    process.exit(1); // Exit with error code
  }
}

function main(): void {
  // Very basic argument parsing for now
  const args = process.argv.slice(2); // Skip 'node' and script path

  if (args.length === 0) {
    console.log('Usage: kota <command>');
    console.log('Available commands: init');
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case 'init':
      initializeKota();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Available commands: init');
      process.exit(1);
  }
}

// Run the main function
main();
