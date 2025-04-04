/**
 * Types related to Model Context Protocol (MCP) functionality
 */

/**
 * Transport type for MCP client connections
 */
export enum MCPTransportType {
  STDIO = 'stdio',
  HTTP = 'http',
}

/**
 * Configuration for an MCP server
 */
export interface MCPServerConfig {
  /** Unique name for the server configuration */
  name: string;

  /** Display name for the server */
  displayName?: string;

  /** Description of the server */
  description?: string;

  /** The type of transport to use for this connection */
  transportType: MCPTransportType;

  /** Connection details, format depends on transportType */
  connection: MCPStdioConnection | MCPHttpConnection;

  /** Whether this is the default server to use when none is specified */
  isDefault?: boolean;

  /** The date this configuration was last used */
  lastUsed?: string;
}

/**
 * Connection settings for stdio-based MCP servers
 */
export interface MCPStdioConnection {
  /** The command to execute to start the stdio server */
  command: string;

  /** Arguments to pass to the command */
  args?: string[];

  /** Environment variables to set for the command */
  env?: Record<string, string>;

  /** Working directory for the command */
  cwd?: string;
}

/**
 * Connection settings for HTTP-based MCP servers
 */
export interface MCPHttpConnection {
  /** The URL of the HTTP server */
  url: string;

  /** Optional API key or access token */
  apiKey?: string;

  /** Additional headers to include with requests */
  headers?: Record<string, string>;
}

/**
 * Complete configuration for MCP functionality
 */
export interface MCPConfig {
  /** List of configured MCP servers */
  servers: MCPServerConfig[];

  /** Name of the default server to use when none is specified */
  defaultServer?: string;
}
