import { ChildProcess, spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Manages the lifecycle of an MCP server process
 */
export class MCPManager {
  private static instance: MCPManager | null = null;
  private mcpProcess: ChildProcess | null = null;
  private logStream: NodeJS.WritableStream | null = null;
  private isConnected = false;

  /**
   * Get the singleton instance of MCPManager
   */
  public static getInstance(): MCPManager {
    if (!MCPManager.instance) {
      MCPManager.instance = new MCPManager();
    }
    return MCPManager.instance;
  }

  private constructor() {
    // Setup clean shutdown handlers
    process.on('exit', () => this.disconnect());
    process.on('SIGINT', () => {
      this.disconnect();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Connect to MCP server by starting the process
   * @param mcpPath Path to the MCP server executable or directory
   * @returns A promise that resolves when the server is started
   */
  public async connect(mcpPath: string): Promise<string> {
    if (this.isConnected) {
      return 'Already connected to MCP server';
    }

    // Determine log file path
    const logFile = path.join(os.homedir(), '.kota-ai', 'mcp.log');
    this.logStream = createWriteStream(logFile, { flags: 'a' });

    // Determine if mcpPath is a file or directory
    let command: string;
    let args: string[];

    if (mcpPath.endsWith('.js')) {
      // Assume it's a Node.js file
      command = 'node';
      args = [mcpPath];
    } else {
      // Assume it's a directory with a built index.js
      command = 'node';
      args = [path.join(mcpPath, 'build/index.js')];
    }

    try {
      // Start the MCP process
      this.mcpProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });

      // Log stdout and stderr
      this.mcpProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        this.logStream?.write(`[MCP stdout] ${output}\n`);
      });

      this.mcpProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        this.logStream?.write(`[MCP stderr] ${output}\n`);
      });

      // Handle process exit
      this.mcpProcess.on('close', (code) => {
        this.logStream?.write(`[MCP] Process exited with code ${code}\n`);
        this.isConnected = false;
        this.mcpProcess = null;
      });

      this.isConnected = true;
      return `Connected to MCP server. Log file: ${logFile}`;
    } catch (error) {
      const errorMessage = `Failed to start MCP server: ${
        error instanceof Error ? error.message : String(error)
      }`;
      this.logStream?.write(`[MCP] ${errorMessage}\n`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Disconnect from MCP server by stopping the process
   * @returns A message indicating the result of the operation
   */
  public disconnect(): string {
    if (!this.isConnected || !this.mcpProcess) {
      return 'Not connected to any MCP server';
    }

    try {
      // Kill the process
      this.mcpProcess.kill('SIGTERM');
      this.isConnected = false;
      this.mcpProcess = null;

      // Close log stream
      this.logStream?.end();
      this.logStream = null;

      return 'Disconnected from MCP server';
    } catch (error) {
      return `Error disconnecting from MCP server: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  /**
   * Check if currently connected to an MCP server
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}
