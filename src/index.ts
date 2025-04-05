/**
 * KOTA AI - Knowledge Oriented Thinking Assistant
 * 
 * A flexible npm package for AI chat interactions and MCP server management.
 */

// Export core modules
export * from './chatbot/index.js';
export * from './ai/index.js';
export * from './mcp/index.js';
export * from './utils/index.js';
export * from './types/index.js';

// Import key components for factory functions
import { ChatbotInterface } from './chatbot/chatbotInterface.js';
import { TerminalInterface } from './chatbot/terminalInterface.js';
import { AnthropicProvider } from './ai/anthropicProvider.js';
import { MCPManager } from './mcp/mcpManager.js';
import { Logger, LogLevel } from './utils/logger.js';

/**
 * Options for creating a chatbot
 */
export interface CreateChatbotOptions {
  // AI Model options
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  
  // MCP options
  mcpPath?: string;
  autoRestartMcp?: boolean;
  mcpRestartDelay?: number;
  
  // General options
  systemMessage?: string;
  logLevel?: LogLevel;
  logPrefix?: string;
}

/**
 * Create a chatbot with the specified options
 * @param options Configuration options
 * @returns An object containing the chatbot and related components
 */
export function createChatbot(options: CreateChatbotOptions = {}) {
  // Create logger
  const logger = new Logger({
    level: options.logLevel,
    prefix: options.logPrefix || 'KOTA',
  });

  // Create AI provider
  const aiProvider = new AnthropicProvider({
    apiKey: options.apiKey,
    model: options.model,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    logger,
  });

  // Create MCP manager if path is provided
  let mcpManager: MCPManager | undefined;
  if (options.mcpPath) {
    mcpManager = new MCPManager({
      mcpPath: options.mcpPath,
      autoRestart: options.autoRestartMcp,
      restartDelay: options.mcpRestartDelay,
      logger,
    });
  }

  // Create chatbot interface
  const chatbot = new ChatbotInterface({
    aiProvider,
    mcpManager,
    logger,
    systemMessage: options.systemMessage,
  });

  return {
    chatbot,
    aiProvider,
    mcpManager,
    logger,
  };
}

/**
 * Create a terminal-based chatbot interface
 * @param options Configuration options
 * @returns An object containing the terminal interface and related components
 */
export function createTerminalChatbot(options: CreateChatbotOptions & { title?: string } = {}) {
  // Create the basic chatbot components
  const { chatbot, aiProvider, mcpManager, logger } = createChatbot(options);
  
  // Create the terminal interface
  const terminal = new TerminalInterface({
    chatbot,
    logger,
    title: options.title,
  });
  
  return {
    terminal,
    chatbot,
    aiProvider,
    mcpManager,
    logger,
  };
}

// This will be removed in production builds
if (process.env.NODE_ENV !== 'production') {
  console.log('KOTA AI package loaded in development mode');
}
