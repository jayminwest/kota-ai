import {
  Client,
  StdioClientTransport,
  HttpClientTransport,
  ServerCapabilities,
  ClientTransport,
} from '@modelcontextprotocol/sdk';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  MCPConfig,
  MCPServerConfig,
  MCPTransportType,
  MCPStdioConnection,
  MCPHttpConnection,
} from '../types/mcp.js';

const KOTA_DIR_NAME = '.kota-ai';
const MCP_CONFIG_FILENAME = 'mcp-config.json';

/**
 * Client for connecting to and interacting with MCP servers
 */
export class MCPClient {
  private client: Client | null = null;
  private transport: ClientTransport | null = null;
  private config: MCPConfig;
  private currentServer: MCPServerConfig | null = null;
  private capabilities: ServerCapabilities | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(
      os.homedir(),
      KOTA_DIR_NAME,
      MCP_CONFIG_FILENAME
    );
    this.config = this.loadConfig();
  }

  /**
   * Load MCP configuration from disk
   */
  private loadConfig(): MCPConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configRaw = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(configRaw) as MCPConfig;
      }
    } catch (error) {
      console.error('Error loading MCP configuration:', error);
    }

    // Return default empty config if loading fails
    return { servers: [] };
  }

  /**
   * Save MCP configuration to disk
   */
  private saveConfig(): void {
    try {
      // Ensure the .kota-ai directory exists
      const kotaDir = path.join(os.homedir(), KOTA_DIR_NAME);
      if (!fs.existsSync(kotaDir)) {
        fs.mkdirSync(kotaDir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving MCP configuration:', error);
      throw new Error(`Failed to save MCP configuration: ${error}`);
    }
  }

  /**
   * Get the list of configured MCP servers
   */
  public getServers(): MCPServerConfig[] {
    return this.config.servers;
  }

  /**
   * Get a server configuration by name
   */
  public getServerByName(name: string): MCPServerConfig | undefined {
    return this.config.servers.find((server) => server.name === name);
  }

  /**
   * Get the default server, or undefined if none is configured
   */
  public getDefaultServer(): MCPServerConfig | undefined {
    if (this.config.defaultServer) {
      const server = this.getServerByName(this.config.defaultServer);
      if (server) return server;
    }

    // If no default is set explicitly, return the first server with isDefault=true
    return this.config.servers.find((server) => server.isDefault);
  }

  /**
   * Add or update a server configuration
   */
  public addServer(serverConfig: MCPServerConfig): void {
    // Remove any existing server with the same name
    this.config.servers = this.config.servers.filter(
      (server) => server.name !== serverConfig.name
    );

    // Add the new server
    this.config.servers.push(serverConfig);

    // If this is the first server, make it the default
    if (this.config.servers.length === 1 || serverConfig.isDefault) {
      this.config.defaultServer = serverConfig.name;

      // If this server is set as default, ensure no others are
      if (serverConfig.isDefault) {
        this.config.servers.forEach((server) => {
          if (server.name !== serverConfig.name) {
            server.isDefault = false;
          }
        });
      }
    }

    this.saveConfig();
  }

  /**
   * Remove a server configuration by name
   */
  public removeServer(name: string): boolean {
    const initialLength = this.config.servers.length;
    this.config.servers = this.config.servers.filter(
      (server) => server.name !== name
    );

    if (this.config.servers.length < initialLength) {
      // If we removed the default server, update the default
      if (this.config.defaultServer === name) {
        this.config.defaultServer =
          this.config.servers.length > 0
            ? this.config.servers[0].name
            : undefined;
      }

      this.saveConfig();
      return true;
    }

    return false;
  }

  /**
   * Set a server as the default
   */
  public setDefaultServer(name: string): boolean {
    const server = this.getServerByName(name);
    if (!server) return false;

    // Update the default server
    this.config.defaultServer = name;

    // Update isDefault flags
    this.config.servers.forEach((s) => {
      s.isDefault = s.name === name;
    });

    this.saveConfig();
    return true;
  }

  /**
   * Connect to an MCP server
   */
  public async connect(serverName?: string): Promise<ServerCapabilities> {
    const server = serverName
      ? this.getServerByName(serverName)
      : this.getDefaultServer();

    if (!server) {
      throw new Error(
        serverName
          ? `Server "${serverName}" not found`
          : 'No server configurations found. Use "kota mcp add" to add a server.'
      );
    }

    // Disconnect if already connected
    if (this.client) {
      await this.disconnect();
    }

    this.currentServer = server;

    // Create the appropriate transport based on the server configuration
    this.transport = this.createTransport(server);

    // Create the MCP client
    this.client = new Client(this.transport);

    try {
      // Initialize the client and get server capabilities
      this.capabilities = await this.client.initialize();

      // Update last used timestamp
      server.lastUsed = new Date().toISOString();
      this.saveConfig();

      return this.capabilities;
    } catch (error) {
      // Clean up on error
      await this.disconnect();
      throw new Error(`Failed to connect to MCP server: ${error}`);
    }
  }

  /**
   * Create the appropriate transport for the server configuration
   */
  private createTransport(server: MCPServerConfig): ClientTransport {
    switch (server.transportType) {
      case MCPTransportType.STDIO: {
        const stdioConfig = server.connection as MCPStdioConnection;

        // Spawn the process for stdio communication
        const childProcess = spawn(
          stdioConfig.command,
          stdioConfig.args || [],
          {
            env: { ...process.env, ...stdioConfig.env },
            cwd: stdioConfig.cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
          }
        );

        // Log stderr output
        childProcess.stderr.on('data', (data) => {
          console.error(`MCP Server stderr: ${data}`);
        });

        return new StdioClientTransport({
          stdin: childProcess.stdin,
          stdout: childProcess.stdout,
          onExit: () => {
            console.log('MCP Server process exited');
            this.client = null;
            this.transport = null;
            this.currentServer = null;
            this.capabilities = null;
          },
        });
      }

      case MCPTransportType.HTTP: {
        const httpConfig = server.connection as MCPHttpConnection;

        return new HttpClientTransport({
          url: httpConfig.url,
          headers: {
            ...(httpConfig.headers || {}),
            ...(httpConfig.apiKey
              ? { Authorization: `Bearer ${httpConfig.apiKey}` }
              : {}),
          },
        });
      }

      default:
        throw new Error(`Unsupported transport type: ${server.transportType}`);
    }
  }

  /**
   * Disconnect from the current MCP server
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.shutdown();
      } catch (error) {
        console.error('Error shutting down MCP client:', error);
      } finally {
        this.client = null;
        this.transport = null;
        this.currentServer = null;
        this.capabilities = null;
      }
    }
  }

  /**
   * Get the current connection status
   */
  public isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Get the currently connected server
   */
  public getCurrentServer(): MCPServerConfig | null {
    return this.currentServer;
  }

  /**
   * Get the capabilities of the currently connected server
   */
  public getServerCapabilities(): ServerCapabilities | null {
    return this.capabilities;
  }

  /**
   * Get the underlying MCP client
   * Throws if not connected
   */
  public getClient(): Client {
    if (!this.client) {
      throw new Error('Not connected to an MCP server');
    }
    return this.client;
  }
}
