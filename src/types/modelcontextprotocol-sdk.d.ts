declare module '@modelcontextprotocol/sdk' {
  /**
   * Server capabilities returned from the MCP server
   */
  export interface ServerCapabilities {
    version: string;
    serverInfo?: {
      name?: string;
      version?: string;
    };
    supportedFeatures?: string[];
    supportedModels?: SupportedModel[];
  }

  /**
   * A model supported by the MCP server
   */
  export interface SupportedModel {
    id: string;
    name?: string;
  }

  /**
   * Client transport interface for MCP
   */
  export interface ClientTransport {
    send(message: any): Promise<void>;
    onMessage(handler: (message: any) => void): void;
    close(): Promise<void>;
  }

  /**
   * Main MCP client
   */
  export class Client {
    constructor(transport: ClientTransport);
    initialize(): Promise<ServerCapabilities>;
    shutdown(): Promise<void>;
  }

  /**
   * Configuration for the StdioClientTransport
   */
  export interface StdioClientTransportOptions {
    stdin: NodeJS.WritableStream;
    stdout: NodeJS.ReadableStream;
    onExit?: () => void;
  }

  /**
   * Standard IO transport for MCP
   */
  export class StdioClientTransport implements ClientTransport {
    constructor(options: StdioClientTransportOptions);
    send(message: any): Promise<void>;
    onMessage(handler: (message: any) => void): void;
    close(): Promise<void>;
  }

  /**
   * Configuration for the HttpClientTransport
   */
  export interface HttpClientTransportOptions {
    url: string;
    headers?: Record<string, string>;
  }

  /**
   * HTTP transport for MCP
   */
  export class HttpClientTransport implements ClientTransport {
    constructor(options: HttpClientTransportOptions);
    send(message: any): Promise<void>;
    onMessage(handler: (message: any) => void): void;
    close(): Promise<void>;
  }
}
