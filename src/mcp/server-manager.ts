import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MCPServerConfig } from '../types/mcp';

const KOTA_DIR = path.join(os.homedir(), '.kota-ai');
const SERVER_CONFIG_FILE = 'mcp-servers.json';

export class MCPServerManager {
  private configPath: string;
  private servers: Map<string, MCPServerConfig> = new Map();
  
  constructor(configDir: string = KOTA_DIR) {
    this.configPath = path.join(configDir, SERVER_CONFIG_FILE);
    this.loadConfigurations();
  }

  /**
   * Load server configurations from the config file
   */
  private loadConfigurations(): void {
    try {
      // Ensure the KOTA directory exists
      if (!fs.existsSync(KOTA_DIR)) {
        fs.mkdirSync(KOTA_DIR, { recursive: true });
      }

      // Check if config file exists
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        const configs: MCPServerConfig[] = JSON.parse(configData);
        
        // Convert array to map for easier lookup
        this.servers.clear();
        for (const config of configs) {
          // Convert string dates back to Date objects
          if (config.lastUsed) {
            config.lastUsed = new Date(config.lastUsed);
          }
          this.servers.set(config.id, config);
        }
      }
    } catch (error) {
      console.error('Failed to load MCP server configurations:', error);
      // Initialize with empty map if load fails
      this.servers = new Map();
    }
  }

  /**
   * Save current server configurations to the config file
   */
  private saveConfigurations(): void {
    try {
      const configs = Array.from(this.servers.values());
      fs.writeFileSync(this.configPath, JSON.stringify(configs, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save MCP server configurations:', error);
      throw new Error(`Failed to save server configurations: ${error}`);
    }
  }

  /**
   * Add or update a server configuration
   * @param config The server configuration to add or update
   */
  addServer(config: MCPServerConfig): void {
    this.servers.set(config.id, config);
    this.saveConfigurations();
  }

  /**
   * Remove a server configuration by ID
   * @param id The ID of the server to remove
   * @returns true if successful, false if server not found
   */
  removeServer(id: string): boolean {
    const result = this.servers.delete(id);
    if (result) {
      this.saveConfigurations();
    }
    return result;
  }

  /**
   * Get a server configuration by ID
   * @param id The ID of the server to retrieve
   * @returns The server configuration or undefined if not found
   */
  getServer(id: string): MCPServerConfig | undefined {
    return this.servers.get(id);
  }

  /**
   * List all server configurations
   * @returns Array of all server configurations
   */
  listServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  /**
   * Update the lastUsed timestamp for a server
   * @param id The ID of the server
   */
  updateLastUsed(id: string): void {
    const server = this.servers.get(id);
    if (server) {
      server.lastUsed = new Date();
      this.saveConfigurations();
    }
  }
}

// Create a singleton instance for use throughout the application
export const mcpServerManager = new MCPServerManager();
