/**
 * Integration tests for MCP functionality
 * 
 * These tests verify that different MCP components work together correctly
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MCPManager } from '../../src/mcpManager.js';
import { execCommand } from '../../src/commands.js';
import { createMock } from '../helpers/test-utils';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mock minimal dependencies for integration tests
vi.mock('node:child_process', () => {
  return {
    spawn: vi.fn(() => ({
      on: vi.fn().mockImplementation(function(event, callback) {
        if (event === 'spawn') {
          callback();
        }
        return this;
      }),
      stdout: {
        on: vi.fn(),
      },
      stderr: {
        on: vi.fn(),
      },
      kill: vi.fn(),
    })),
  };
});

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('MCP Integration', () => {
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  let mcpManager: MCPManager;
  
  beforeEach(() => {
    // Reset the MCPManager instance before each test
    // @ts-expect-error: Accessing private static field for testing
    MCPManager.instance = null;
    mcpManager = MCPManager.getInstance();
    
    // Clear console mocks
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect and disconnect from an MCP server', async () => {
    // Mock the path to a hypothetical MCP server
    const mockMcpPath = path.join(__dirname, '../../node_modules/.bin/mcp-mock');
    
    // Connect to MCP server
    await mcpManager.connect(mockMcpPath);
    expect(mcpManager.isConnectedToServer()).toBe(true);
    
    // Disconnect from MCP server
    mcpManager.disconnect();
    expect(mcpManager.isConnectedToServer()).toBe(false);
  });

  it('should integrate with the command interface', async () => {
    // Mock the path to a hypothetical MCP server
    const mockMcpPath = path.join(__dirname, '../../node_modules/.bin/mcp-mock');
    
    // Execute MCP commands through the command interface
    await execCommand(['mcp', 'connect', mockMcpPath]);
    expect(mcpManager.isConnectedToServer()).toBe(true);
    
    await execCommand(['mcp', 'status']);
    expect(consoleLogSpy).toHaveBeenCalledWith('MCP Status: Connected');
    
    await execCommand(['mcp', 'disconnect']);
    expect(mcpManager.isConnectedToServer()).toBe(false);
  });
});
