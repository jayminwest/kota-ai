import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, ChatMessage, ChatOptions } from '../types/ai.js';

/**
 * AnthropicProvider implements the AIProvider interface for Claude models
 */
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-opus-20240229') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    try {
      // Format messages for Anthropic API
      const formattedMessages = messages
        .filter((msg) => msg.role !== 'system') // Remove system messages from the array
        .map((msg) => ({
          role:
            msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
          content: msg.content,
        }));

      // Special handling for system messages - if the first message is a system message,
      // use it as the system parameter instead
      let systemPrompt: string | undefined = options?.systemPrompt;
      if (
        messages.length > 0 &&
        messages[0].role === 'system' &&
        !systemPrompt
      ) {
        systemPrompt = messages[0].content;
      }

      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        messages: formattedMessages as any, // Type casting to avoid TypeScript errors
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
      });

      // Safely access the text content
      if (response.content.length > 0 && 'text' in response.content[0]) {
        return response.content[0].text;
      }
      return ''; // Return empty string if no text content is available
    } catch (error) {
      console.error('Error in Anthropic provider:', error);
      throw new Error(
        `Anthropic API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    options?: ChatOptions
  ): Promise<void> {
    try {
      // Format messages for Anthropic API
      const formattedMessages = messages
        .filter((msg) => msg.role !== 'system') // Remove system messages from the array
        .map((msg) => ({
          role:
            msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
          content: msg.content,
        }));

      // Special handling for system messages - if the first message is a system message,
      // use it as the system parameter instead
      let systemPrompt: string | undefined = options?.systemPrompt;
      if (
        messages.length > 0 &&
        messages[0].role === 'system' &&
        !systemPrompt
      ) {
        systemPrompt = messages[0].content;
      }

      const stream = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        messages: formattedMessages as any, // Type casting to avoid TypeScript errors
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta &&
          'text' in chunk.delta &&
          chunk.delta.text
        ) {
          onChunk(chunk.delta.text);
        }
      }

      onComplete();
    } catch (error) {
      console.error('Error in Anthropic streaming:', error);
      throw new Error(
        `Anthropic API streaming error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
