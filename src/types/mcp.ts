export interface MCPServerConfig {
  /**
   * Unique identifier for the server configuration
   */
  id: string;

  /**
   * Descriptive name for the MCP server
   */
  name: string;

  /**
   * Transport type for MCP communication
   */
  transport: 'stdio' | 'http';

  /**
   * For http transport: URL to the MCP server
   * For stdio transport: Command to execute
   */
  endpoint: string;

  /**
   * Additional transport-specific options
   */
  options?: {
    /**
     * Arguments for the stdio command
     */
    args?: string[];

    /**
     * HTTP specific options
     */
    headers?: Record<string, string>;
    
    /**
     * HTTP specific option for SSE
     */
    useSSE?: boolean;
  };

  /**
   * Date when this configuration was last used
   */
  lastUsed?: Date;
}

export interface MCPConnectionState {
  connected: boolean;
  currentServer?: string; // ID of the connected server
  error?: string;
  lastConnected?: Date;
}

export interface MCPServerConfig {
  /**
   * Unique identifier for the server configuration
   */
  id: string;

  /**
   * Descriptive name for the MCP server
   */
  name: string;

  /**
   * Transport type for MCP communication
   */
  transport: 'stdio' | 'http';

  /**
   * For http transport: URL to the MCP server
   * For stdio transport: Command to execute
   */
  endpoint: string;

  /**
   * Additional transport-specific options
   */
  options?: {
    /**
     * Arguments for the stdio command
     */
    args?: string[];

    /**
     * HTTP specific options
     */
    headers?: Record<string, string>;
    
    /**
     * HTTP specific option for SSE
     */
    useSSE?: boolean;
  };

  /**
   * Date when this configuration was last used
   */
  lastUsed?: Date;
}

export interface MCPConnectionState {
  connected: boolean;
  currentServer?: string; // ID of the connected server
  error?: string;
  lastConnected?: Date;
}
