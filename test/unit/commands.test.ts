/**
 * Unit tests for commands.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execCommand } from '../../src/commands.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// Mock dependencies
vi.mock('node:fs');
vi.mock('node:path');
vi.mock('node:os');
vi.mock('../../src/anthropicService.js', () => {
  return {
    AnthropicService: {
      getInstance: vi.fn(() => ({
        chatWithAI: vi.fn((message, onChunk, onComplete) => {
          onChunk('Mock AI response');
          onComplete();
          return Promise.resolve();
        }),
      })),
    },
  };
});
vi.mock('../../src/mcpManager.js', () => {
  return {
    MCPManager: {
      getInstance: vi.fn(() => ({
        connect: vi.fn().mockResolvedValue('Connected to MCP server'),
        disconnect: vi.fn().mockReturnValue('Disconnected from MCP server'),
        isConnectedToServer: vi.fn().mockReturnValue(false),
      })),
    },
  };
});
vi.mock('../../src/mcp/commands.js');

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('commands', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Setup mock implementations
    vi.mocked(os.homedir).mockReturnValue('/mock/home');
    vi.mocked(path.join).mockImplementation((...paths) => paths.join('/'));
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    // Clear all mocks after each test
    vi.clearAllMocks();
  });

  describe('execCommand', () => {
    it('should show help when no arguments are provided', async () => {
      await execCommand([]);
      expect(consoleLogSpy).toHaveBeenCalledWith('Usage: kota <command>');
    });

    it('should initialize KOTA directories when init command is provided', async () => {
      await execCommand(['init']);
      
      // Check if directories are created
      expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith('KOTA initialized successfully.');
    });

    it('should display error when chat command is provided without a message', async () => {
      await execCommand(['chat']);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Please provide a message to chat with the AI.');
    });

    it('should call chatWithAI when chat command is provided with a message', async () => {
      await execCommand(['chat', 'Hello', 'KOTA']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('AI: Thinking...');
      expect(consoleLogSpy).toHaveBeenCalledWith('AI: Mock AI response');
    });

    it('should display error for unknown commands', async () => {
      await execCommand(['unknown']);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: unknown');
      // Should show help after unknown command
      expect(consoleLogSpy).toHaveBeenCalledWith('Usage: kota <command>');
    });
  });
});
