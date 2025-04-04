import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { MCPServerConfig } from '../types/mcp';

// We're using require for the MCP SDK to avoid ESM import issues
const mcp = require('@modelcontextprotocol/sdk');

/**
 * Events emitted by the MCPClient
 */
export enum MCPClientEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  MESSAGE = 'message',
}

/**
 * Client wrapper for MCP SDK that manages connections and lifecycle
 */
export class MCPClient extends EventEmitter {
  private client: any = null;
  private transport: any = null;
  private config: MCPServerConfig | null = null;
  private connected = false;

  /**
   * Connect to an MCP server using the provided configuration
   * @param config The server configuration to connect to
   */
  async connect(config: MCPServerConfig): Promise<void> {
    // Disconnect if already connected
    if (this.connected) {
      await this.disconnect();
    }

    this.config = config;
    
    try {
      // Initialize the appropriate transport based on config
      if (config.transport === 'stdio') {
        const childProcess = spawn(config.endpoint, config.options?.args || []);
        
        // Create a StdioServerParameters object
        const serverParams = {
          command: config.endpoint,
          args: config.options?.args || [],
          stderr: 'inherit',
        };
        
        const StdioClientTransport = require('@modelcontextprotocol/sdk/client/stdio').StdioClientTransport;
        this.transport = new StdioClientTransport(serverParams);
      } else if (config.transport === 'http') {
        const url = new URL(config.endpoint);
        const SSEClientTransport = require('@modelcontextprotocol/sdk/client/sse').SSEClientTransport;
        this.transport = new SSEClientTransport(url, {
          requestInit: {
            headers: config.options?.headers,
          },
          eventSourceInit: {
            withCredentials: true
          },
        });
      } else {
        throw new Error(`Unsupported transport type: ${config.transport}`);
      }

      // Create the MCP client with the transport
      const Client = require('@modelcontextprotocol/sdk/client').Client;
      this.client = new Client({
        name: 'KOTA AI Client',
        version: '1.0.0'
      });

      // Set up event handlers
      this.client.on('connected', () => {
        this.connected = true;
        this.emit(MCPClientEvent.CONNECTED, { serverId: config.id });
      });

      this.client.on('disconnected', () => {
        this.connected = false;
        this.emit(MCPClientEvent.DISCONNECTED, { serverId: config.id });
      });

      this.client.on('error', (error: Error) => {
        this.emit(MCPClientEvent.ERROR, { error, serverId: config.id });
      });

      // Connect the client
      await this.client.connect(this.transport);
      
      // Update last used timestamp
      this.config.lastUsed = new Date();
      
    } catch (error) {
      this.emit(MCPClientEvent.ERROR, { 
        error: error instanceof Error ? error : new Error(String(error)),
        serverId: config.id 
      });
      throw error;
    }
  }

  /**
   * Disconnect from the currently connected MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.disconnect();
    } catch (error) {
      this.emit(MCPClientEvent.ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        serverId: this.config?.id
      });
    } finally {
      this.client = null;
      this.transport = null;
      this.connected = false;
    }
  }

  /**
   * Check if the client is currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the current server configuration
   */
  getCurrentConfig(): MCPServerConfig | null {
    return this.config;
  }

  /**
   * Get the underlying MCP client instance
   */
  getMCPClient(): any {
    return this.client;
  }
}

// Create a singleton instance for use throughout the application
export const mcpClient = new MCPClient();
