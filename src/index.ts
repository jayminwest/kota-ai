/**
 * KOTA - Knowledge Oriented Thinking Assistant
 * Export primary modules for use as a library
 */

// Export AI types and providers
export * from './types/ai.js';
export { AnthropicProvider } from './ai/anthropicProvider.js';

// Export chatbot interfaces
export { TerminalInterface } from './chatbot/terminalInterface.js';

// Export the AnthropicService
export * from './anthropicService.js';

// Export the OllamaService
export * from './ollamaService.js';

// Export the PersistentChatInterface
export * from './persistentChat.js';

// Export model commands/utilities
export * from './model-commands.js';

// Export MCP-related functionality
export { MCPManager } from './mcpManager.js';
export * from './mcp/index.js';

// Export command execution function
export { execCommand } from './commands.js';
export * from './commands.js';

// This will be the main entry point for the package
console.log('KOTA AI package loaded successfully.');
