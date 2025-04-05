import Anthropic from '@anthropic-ai/sdk';
import { ModelConfig } from './types/model-config.js';
import { ModelConfigLoader } from './config/model-config-loader.js';

/**
 * Service for interacting with the Anthropic API
 */
export class AnthropicService {
  private static instance: AnthropicService | null = null;
  private client: Anthropic;
  private configLoader: ModelConfigLoader;
  private currentModel: ModelConfig | undefined;

  /**
   * Get the singleton instance of AnthropicService
   */
  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  private constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. Please set it to use the chat functionality.'
      );
    }

    this.client = new Anthropic({
      apiKey,
    });

    // Initialize the config loader and get the default model
    this.configLoader = new ModelConfigLoader();
    
    // Try to get the default Anthropic model or the first available one
    const anthropicModels = this.configLoader.getModelsByProvider('anthropic');
    
    if (anthropicModels.length === 0) {
      console.warn('No Anthropic models found in configuration, using default Claude 3 Sonnet');
      // If no models found, create a default model config
      this.currentModel = {
        id: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        name: 'Claude 3 Sonnet',
        description: 'Anthropic\'s balanced model for most tasks',
        parameters: {
          temperature: 0.7,
          max_tokens: 4096,
          system: 'You are KOTA, a Knowledge Oriented Thinking Assistant. You provide helpful, accurate, and concise answers.'
        },
        default: true
      };
    } else {
      // Get default model from the anthropic models
      this.currentModel = anthropicModels.find(model => model.default) || anthropicModels[0];
    }
  }

  /**
   * Chat with the AI using streaming API
   * @param message User message
   * @param onChunk Callback for each text chunk received from the API
   * @param onComplete Callback when the streaming is complete
   */
  public async chatWithAI(
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      if (!this.currentModel) {
        throw new Error('No model configuration available');
      }

      // Create a copy of the parameters to avoid modifying the original
      const parameters = { ...this.currentModel.parameters };
      
      const stream = await this.client.messages.create({
        model: this.currentModel.id,
        max_tokens: parameters.max_tokens,
        temperature: parameters.temperature,
        system: parameters.system,
        messages: [{ role: 'user', content: message }],
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Error communicating with Anthropic API: ${errorMessage}`
      );
    }
  }

  /**
   * Get all available Anthropic models
   * @returns Array of available models
   */
  public getAvailableModels(): ModelConfig[] {
    return this.configLoader.getModelsByProvider('anthropic');
  }

  /**
   * Get the currently active model
   * @returns The current model configuration
   */
  public getCurrentModel(): ModelConfig | undefined {
    return this.currentModel;
  }

  /**
   * Set the current model by ID
   * @param modelId The ID of the model to use
   * @returns True if successful, false if model not found
   */
  public setCurrentModel(modelId: string): boolean {
    const model = this.configLoader.getModelById(modelId);
    
    // Check if model exists and is an Anthropic model
    if (!model || model.provider !== 'anthropic') {
      return false;
    }
    
    this.currentModel = model;
    return true;
  }
}
