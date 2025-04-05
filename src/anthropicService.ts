import Anthropic from '@anthropic-ai/sdk';

/**
 * Service for interacting with the Anthropic API
 */
export class AnthropicService {
  private static instance: AnthropicService | null = null;
  private client: Anthropic;

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
      console.warn(
        'ANTHROPIC_API_KEY environment variable is not set. Anthropic models will not be available.'
      );
      // Initialize with a dummy key that will be checked before use
      this.client = new Anthropic({
        apiKey: 'dummy_key_anthropic_unavailable',
      });
    } else {
      this.client = new Anthropic({
        apiKey,
      });
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
    // Check if API key is available
    if (this.client.apiKey === 'dummy_key_anthropic_unavailable') {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. Please set it to use Anthropic models.'
      );
    }

    try {
      const stream = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        system:
          'You are KOTA, a Knowledge Oriented Thinking Assistant. You provide helpful, accurate, and concise answers.',
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
}
