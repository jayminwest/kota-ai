// Export AI types and providers
export * from './types/ai.js';
export { AnthropicProvider } from './ai/anthropicProvider.js';

// Export chatbot interfaces
export { TerminalInterface } from './chatbot/terminalInterface.js';

// Export MCP-related functionality
export { MCPManager } from './mcpManager.js';
export * from './mcp/index.js';

// Export backward compatibility components
export { AnthropicService } from './anthropicService.js';
export { PersistentChatInterface } from './persistentChat.js';
export { execCommand } from './commands.js';
export * from './commands.js';

// This will be the main entry point for the package
console.log('KOTA AI package loaded successfully.');
