import { ChatMessage } from '../chatbot/chatbotInterface.js';

/**
 * Interface for AI model providers
 */
export interface AIModelProvider {
  /**
   * Generate a response from the AI model
   * @param messages The conversation messages
   * @param onChunk Optional callback for streaming responses
   * @returns Promise that resolves when generation is complete
   */
  generateResponse(
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<void>;
  
  /**
   * Set the model to use
   * @param model The model identifier
   */
  setModel(model: string): void;
  
  /**
   * Get information about the current model
   * @returns Information about the model
   */
  getModelInfo(): { model: string; provider: string };
}
