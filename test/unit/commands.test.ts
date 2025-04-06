/**
 * Unit tests for the commands module
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execCommand } from '../../src/commands.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createMock } from '../helpers/test-utils';

// Mock dependencies
vi.mock('node:fs');
vi.mock('node:path');
vi.mock('node:os');
vi.mock('../../src/anthropicService.js', () => {
  return {
    AnthropicService: {
      getInstance: () => ({
        chatWithAI: vi.fn(async (message, onChunk, onComplete) => {
          onChunk?.('Mock AI response');
          onComplete?.();
          return 'Mock AI response';
        }),
      }),
    },
  };
});
vi.mock('../../src/mcpManager.js', () => {
  return {
    MCPManager: {
      getInstance: () => ({
        connect: vi.fn().mockResolvedValue('Connected to MCP server'),
        disconnect: vi.fn().mockReturnValue('Disconnected from MCP server'),
        isConnectedToServer: vi.fn().mockReturnValue(false),
      }),
    },
  };
});
vi.mock('../../src/mcp/commands.js');

describe('commands', () => {
  // Spy on console methods
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    // Mock implementation of required functions
    vi.mocked(os.homedir).mockReturnValue('/mock/home');
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show help when no command is provided', async () => {
    await execCommand([]);
    expect(consoleLogSpy).toHaveBeenCalledWith('Usage: kota <command>');
  });

  it('should initialize KOTA directories', async () => {
    await execCommand(['init']);
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('KOTA initialized successfully.');
  });

  it('should handle chat command', async () => {
    await execCommand(['chat', 'Hello', 'AI']);
    expect(consoleLogSpy).toHaveBeenCalledWith('AI: Thinking...');
    expect(consoleLogSpy).toHaveBeenCalledWith('AI: Mock AI response');
  });

  it('should show error when chat command has no message', async () => {
    await execCommand(['chat']);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Please provide a message to chat with the AI.');
  });

  it('should show error for unknown command', async () => {
    await execCommand(['unknown-command']);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: unknown-command');
  });

  describe('MCP Commands', () => {
    it('should handle mcp connect command', async () => {
      await execCommand(['mcp', 'connect', '/path/to/mcp']);
      // We can't easily test this directly since the function is mocked
      // Instead, verify the console output
      expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MCP server');
    });

    it('should handle mcp disconnect command', async () => {
      await execCommand(['mcp', 'disconnect']);
      expect(consoleLogSpy).toHaveBeenCalledWith('Disconnected from MCP server');
    });

    it('should handle mcp status command', async () => {
      await execCommand(['mcp', 'status']);
      expect(consoleLogSpy).toHaveBeenCalledWith('MCP Status: Not connected');
    });
  });
});
