/**
 * Type definitions for AI providers and chat interactions
 */

/**
 * Represents a message in a chat conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Options for chat completion
 */
export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

/**
 * AI provider interface that all model providers must implement
 */
export interface AIProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  chatStream?(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    options?: ChatOptions
  ): Promise<void>;
}
