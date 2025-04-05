import { EventEmitter } from 'node:events';
import { AIModelProvider } from '../ai/modelProvider.js';
import { MCPManager } from '../mcp/mcpManager.js';
import { Logger } from '../utils/logger.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotOptions {
  aiProvider: AIModelProvider;
  mcpManager?: MCPManager;
  logger?: Logger;
  systemMessage?: string;
}

/**
 * Core chatbot interface for interacting with AI models
 */
export class ChatbotInterface extends EventEmitter {
  private aiProvider: AIModelProvider;
  private mcpManager?: MCPManager;
  private logger: Logger;
  private conversation: ChatMessage[] = [];
  private systemMessage?: string;

  /**
   * Create a new chatbot interface
   * @param options Configuration options for the chatbot
   */
  constructor(options: ChatbotOptions) {
    super();
    this.aiProvider = options.aiProvider;
    this.mcpManager = options.mcpManager;
    this.logger = options.logger || new Logger();
    
    if (options.systemMessage) {
      this.setSystemMessage(options.systemMessage);
    }
  }

  /**
   * Set or update the system message for the conversation
   * @param content System message content
   */
  public setSystemMessage(content: string): void {
    this.systemMessage = content;
    
    // Find existing system message or add a new one
    const systemIndex = this.conversation.findIndex(msg => msg.role === 'system');
    const message: ChatMessage = {
      role: 'system',
      content,
      timestamp: new Date()
    };
    
    if (systemIndex >= 0) {
      this.conversation[systemIndex] = message;
    } else {
      this.conversation.unshift(message);
    }
    
    this.logger.debug('System message set', { content });
    this.emit('systemMessage', content);
  }

  /**
   * Send a message to the AI model and get a response
   * @param message User message to send
   * @param streamHandler Optional handler for streamed responses
   * @returns Promise resolving to the complete response
   */
  public async sendMessage(
    message: string,
    streamHandler?: (chunk: string) => void
  ): Promise<string> {
    // Add user message to conversation
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.conversation.push(userMessage);
    
    this.logger.debug('User message added', { content: message });
    this.emit('userMessage', userMessage);

    try {
      // Create a function to handle streaming responses if needed
      let responseContent = '';
      const handleStream = streamHandler 
        ? (chunk: string) => {
            responseContent += chunk;
            streamHandler(chunk);
          }
        : (chunk: string) => {
            responseContent += chunk;
          };

      // Get response from AI model
      await this.aiProvider.generateResponse(
        this.conversation,
        handleStream
      );
      
      // Add assistant response to conversation
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      this.conversation.push(assistantMessage);
      
      this.logger.debug('Assistant response added', { content: responseContent });
      this.emit('assistantMessage', assistantMessage);
      
      return responseContent;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      this.logger.error('Error getting AI response', { error: errorMessage });
      this.emit('error', errorMessage);
      throw error;
    }
  }

  /**
   * Execute a command through the MCP server if available
   * @param command Command to execute
   * @returns Promise resolving to the command result
   */
  public async executeCommand(command: string): Promise<string> {
    if (!this.mcpManager) {
      const error = 'MCP Manager not available for command execution';
      this.logger.error(error);
      this.emit('error', error);
      throw new Error(error);
    }

    if (!this.mcpManager.isConnectedToServer()) {
      const error = 'Not connected to any MCP server';
      this.logger.error(error);
      this.emit('error', error);
      throw new Error(error);
    }

    try {
      this.logger.debug('Executing command', { command });
      this.emit('command', command);
      
      // This is a placeholder implementation
      // In a real implementation, we'd need to determine how commands
      // are sent to the MCP server
      return `Command executed: ${command}`;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      this.logger.error('Error executing MCP command', { error: errorMessage });
      this.emit('error', errorMessage);
      throw error;
    }
  }

  /**
   * Clear the conversation history
   * @param keepSystemMessage Whether to keep the system message
   */
  public clearConversation(keepSystemMessage = true): void {
    if (keepSystemMessage && this.systemMessage) {
      // Keep only the system message
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.systemMessage,
        timestamp: new Date()
      };
      this.conversation = [systemMessage];
    } else {
      this.conversation = [];
    }
    
    this.logger.debug('Conversation cleared', { keepSystemMessage });
    this.emit('conversationCleared', keepSystemMessage);
  }

  /**
   * Get the current conversation history
   * @returns Array of conversation messages
   */
  public getConversation(): ChatMessage[] {
    return [...this.conversation];
  }
}
