/**
 * Mock SDK implementation to avoid import issues
 * This provides the necessary types and classes for our MCP implementation to work
 * without relying on the complex @modelcontextprotocol/sdk package structure
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

export interface SupportedModel {
  id: string;
  name?: string;
}

export interface ClientTransport {
  send(message: any): Promise<void>;
  onMessage(handler: (message: any) => void): void;
  close(): Promise<void>;
}

export class Client {
  constructor(private transport: ClientTransport) {}

  async initialize(): Promise<ServerCapabilities> {
    // Return a simple mock capability response
    return {
      version: '1.0',
      serverInfo: {
        name: 'Mock MCP Server',
        version: '1.0.0',
      },
      supportedFeatures: ['text-generation'],
      supportedModels: [
        {
          id: 'mock-model',
          name: 'Mock Model',
        },
      ],
    };
  }

  async shutdown(): Promise<void> {
    await this.transport.close();
  }
}

export interface StdioClientTransportOptions {
  stdin: NodeJS.WritableStream;
  stdout: NodeJS.ReadableStream;
  onExit?: () => void;
}

export class StdioClientTransport implements ClientTransport {
  private messageHandler: ((message: any) => void) | null = null;
  private onExit: (() => void) | null = null;

  constructor(options: StdioClientTransportOptions) {
    this.onExit = options.onExit || null;
  }

  async send(message: any): Promise<void> {
    // Mock implementation
    console.log('Mock StdioClientTransport.send called');
  }

  onMessage(handler: (message: any) => void): void {
    this.messageHandler = handler;
  }

  async close(): Promise<void> {
    // Mock implementation
    console.log('Mock StdioClientTransport.close called');
    if (this.onExit) {
      this.onExit();
    }
  }
}

export interface HttpClientTransportOptions {
  url: string;
  headers?: Record<string, string>;
}

export class HttpClientTransport implements ClientTransport {
  private messageHandler: ((message: any) => void) | null = null;

  constructor(options: HttpClientTransportOptions) {
    // Store options if needed
  }

  async send(message: any): Promise<void> {
    // Mock implementation
    console.log('Mock HttpClientTransport.send called');
  }

  onMessage(handler: (message: any) => void): void {
    this.messageHandler = handler;
  }

  async close(): Promise<void> {
    // Mock implementation
    console.log('Mock HttpClientTransport.close called');
  }
}
