import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage } from '../chatbot/chatbotInterface.js';
import { AIModelProvider } from './modelProvider.js';
import { Logger } from '../utils/logger.js';

export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  logger?: Logger;
}

/**
 * AI model provider implementation for Anthropic Claude models
 */
export class AnthropicProvider implements AIModelProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private logger: Logger;

  /**
   * Create a new Anthropic provider
   * @param options Provider configuration options
   */
  constructor(options: AnthropicProviderOptions = {}) {
    // Get API key from options or environment variable
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY not provided. Pass it in options or set the ANTHROPIC_API_KEY environment variable.'
      );
    }

    this.client = new Anthropic({ apiKey });
    this.model = options.model || 'claude-3-sonnet-20240229';
    this.maxTokens = options.maxTokens || 1000;
    this.temperature = options.temperature || 0.7;
    this.logger = options.logger || new Logger();
    
    this.logger.debug('Initialized Anthropic provider', {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    });
  }

  /**
   * Generate a response from the Anthropic model
   * @param messages The conversation messages
   * @param onChunk Optional callback for streaming responses
   */
  public async generateResponse(
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<void> {
    try {
      // Extract system message - Anthropic needs it as a separate parameter
      let systemMessage = '';
      const anthropicMessages = messages
        .filter(msg => {
          if (msg.role === 'system') {
            systemMessage = msg.content;
            return false;
          }
          return msg.role === 'user' || msg.role === 'assistant';
        })
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      this.logger.debug('Generating response from Anthropic', {
        model: this.model,
        messageCount: anthropicMessages.length,
        hasSystemMessage: !!systemMessage,
      });

      // Use streaming if onChunk is provided
      if (onChunk) {
        const stream = await this.client.messages.create({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: systemMessage,
          messages: anthropicMessages,
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
      } else {
        // Non-streaming version
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: systemMessage,
          messages: anthropicMessages,
        });

        // The response is already added to the conversation by the chatbot
        this.logger.debug('Generated response from Anthropic', {
          responseId: response.id,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      this.logger.error('Error generating response from Anthropic', {
        error: errorMessage,
      });
      
      throw new Error(`Error communicating with Anthropic API: ${errorMessage}`);
    }
  }

  /**
   * Set the model to use
   * @param model The model identifier
   */
  public setModel(model: string): void {
    this.model = model;
    this.logger.debug('Changed Anthropic model', { model });
  }

  /**
   * Set the maximum number of tokens for responses
   * @param maxTokens The maximum number of tokens
   */
  public setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
    this.logger.debug('Changed max tokens', { maxTokens });
  }

  /**
   * Set the temperature for generation
   * @param temperature The temperature value (0-1)
   */
  public setTemperature(temperature: number): void {
    if (temperature < 0 || temperature > 1) {
      throw new Error('Temperature must be between 0 and 1');
    }
    this.temperature = temperature;
    this.logger.debug('Changed temperature', { temperature });
  }

  /**
   * Get information about the current model
   */
  public getModelInfo(): { model: string; provider: string } {
    return {
      model: this.model,
      provider: 'Anthropic',
    };
  }
}
