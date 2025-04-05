import { ChildProcess, spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { EventEmitter } from 'node:events';
import { Logger } from '../utils/logger.js';

export interface MCPManagerOptions {
  mcpPath?: string;
  logDirectory?: string;
  logger?: Logger;
  autoRestart?: boolean;
  restartDelay?: number;
}

/**
 * Manager for MCP server lifecycle
 */
export class MCPManager extends EventEmitter {
  private mcpProcess: ChildProcess | null = null;
  private logStream: NodeJS.WritableStream | null = null;
  private isConnected = false;
  private mcpPath: string;
  private logDirectory: string;
  private logger: Logger;
  private autoRestart: boolean;
  private restartDelay: number;
  private restartTimeout: NodeJS.Timeout | null = null;

  /**
   * Create a new MCP Manager
   * @param options Configuration options
   */
  constructor(options: MCPManagerOptions = {}) {
    super();
    
    this.mcpPath = options.mcpPath || '';
    this.logDirectory = options.logDirectory || path.join(os.homedir(), '.kota-ai');
    this.logger = options.logger || new Logger();
    this.autoRestart = options.autoRestart ?? true;
    this.restartDelay = options.restartDelay ?? 5000;

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
  public async connect(mcpPath?: string): Promise<string> {
    if (this.isConnected) {
      return 'Already connected to MCP server';
    }

    // Use the provided path or the one from constructor
    if (mcpPath) {
      this.mcpPath = mcpPath;
    }

    if (!this.mcpPath) {
      throw new Error('MCP path not provided');
    }

    // Determine log file path
    const logFile = path.join(this.logDirectory, 'mcp.log');
    
    try {
      // Ensure the log directory exists
      await new Promise<void>((resolve, reject) => {
        const { mkdir } = require('node:fs');
        mkdir(this.logDirectory, { recursive: true }, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      this.logStream = createWriteStream(logFile, { flags: 'a' });
    } catch (error) {
      throw new Error(`Failed to create log directory: ${error}`);
    }

    // Determine if mcpPath is a file or directory
    let command: string;
    let args: string[];

    if (this.mcpPath.endsWith('.js')) {
      // Assume it's a Node.js file
      command = 'node';
      args = [this.mcpPath];
    } else {
      // Assume it's a directory with a built index.js
      command = 'node';
      args = [path.join(this.mcpPath, 'build/index.js')];
    }

    try {
      this.logger.debug('Starting MCP server process', { command, args });
      
      // Start the MCP process
      this.mcpProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });

      // Log stdout and stderr
      this.mcpProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        this.logStream?.write(`[MCP stdout] ${output}\n`);
        this.emit('output', output);
      });

      this.mcpProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        this.logStream?.write(`[MCP stderr] ${output}\n`);
        this.emit('error', output);
      });

      // Handle process error
      this.mcpProcess.on('error', (err) => {
        this.logStream?.write(`[MCP] Process error: ${err}\n`);
        this.logger.error('MCP process error', { error: err.message });
        this.emit('error', err);
        this.isConnected = false;
        this.mcpProcess = null;
        
        this.handleProcessExit();
      });

      // Handle process exit
      this.mcpProcess.on('close', (code) => {
        this.logStream?.write(`[MCP] Process exited with code ${code}\n`);
        this.logger.info('MCP process exited', { code });
        this.emit('exit', code);
        this.isConnected = false;
        this.mcpProcess = null;
        
        this.handleProcessExit();
      });

      this.isConnected = true;
      this.emit('connected');
      this.logger.info('Connected to MCP server', { logFile });
      
      return `Connected to MCP server. Log file: ${logFile}`;
    } catch (error) {
      const errorMessage = `Failed to start MCP server: ${
        error instanceof Error ? error.message : String(error)
      }`;
      this.logStream?.write(`[MCP] ${errorMessage}\n`);
      this.logger.error('Failed to start MCP server', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  /**
   * Handle MCP process exit and potentially restart it
   */
  private handleProcessExit(): void {
    // Restart the process if auto-restart is enabled
    if (this.autoRestart && this.mcpPath) {
      this.logger.info('Auto-restarting MCP server', { delay: this.restartDelay });
      
      // Clear existing restart timeout if any
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
      }
      
      // Set a new restart timeout
      this.restartTimeout = setTimeout(async () => {
        try {
          await this.connect();
        } catch (error) {
          this.logger.error('Failed to restart MCP server', { 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }, this.restartDelay);
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
      // Clear any restart timeout
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }
      
      // Kill the process
      this.mcpProcess.kill('SIGTERM');
      this.isConnected = false;
      this.mcpProcess = null;

      // Close log stream
      this.logStream?.end();
      this.logStream = null;

      this.logger.info('Disconnected from MCP server');
      this.emit('disconnected');
      
      return 'Disconnected from MCP server';
    } catch (error) {
      const errorMessage = `Error disconnecting from MCP server: ${
        error instanceof Error ? error.message : String(error)
      }`;
      this.logger.error(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Check if currently connected to an MCP server
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Set auto-restart behavior
   * @param autoRestart Whether to automatically restart the server
   * @param delay Delay in milliseconds before restarting
   */
  public setAutoRestart(autoRestart: boolean, delay?: number): void {
    this.autoRestart = autoRestart;
    if (delay !== undefined) {
      this.restartDelay = delay;
    }
  }
  
  /**
   * Set the path to the MCP server executable
   * @param mcpPath MCP server path
   */
  public setMCPPath(mcpPath: string): void {
    this.mcpPath = mcpPath;
  }
}
