declare module '@modelcontextprotocol/sdk/client' {
  import { ClientTransport } from '@modelcontextprotocol/sdk/client/stdio';
  import { ServerCapabilities } from '@modelcontextprotocol/sdk/shared';

  export class Client {
    constructor(transport: ClientTransport);
    initialize(): Promise<ServerCapabilities>;
    shutdown(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio' {
  export interface ClientTransport {
    send(message: any): Promise<void>;
    onMessage(handler: (message: any) => void): void;
    close(): Promise<void>;
  }

  export interface StdioClientTransportOptions {
    stdin: NodeJS.WritableStream;
    stdout: NodeJS.ReadableStream;
    onExit?: () => void;
  }

  export class StdioClientTransport implements ClientTransport {
    constructor(options: StdioClientTransportOptions);
    send(message: any): Promise<void>;
    onMessage(handler: (message: any) => void): void;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/sse' {
  import { ClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

  export interface HttpClientTransportOptions {
    url: string;
    headers?: Record<string, string>;
  }

  export class HttpClientTransport implements ClientTransport {
    constructor(options: HttpClientTransportOptions);
    send(message: any): Promise<void>;
    onMessage(handler: (message: any) => void): void;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/shared' {
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
}
