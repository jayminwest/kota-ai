// Export all functionality from the package
export { execCommand } from './commands.js';
export { PersistentChatInterface } from './persistentChat.js';
export { MCPManager } from './mcpManager.js';
export { AnthropicService } from './anthropicService.js';
// Re-export modules
export * from './commands.js';
export * from './persistentChat.js';
export * from './mcp/index.js';

// This will be the main entry point for the package
console.log('KOTA AI package loaded successfully.');
