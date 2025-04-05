/**
 * Service for interacting with the Ollama API
 */
export class OllamaService {
  private static instance: OllamaService | null = null;
  private baseUrl: string;

  /**
   * Get the singleton instance of OllamaService
   */
  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  private constructor() {
    this.baseUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
  }

  /**
   * List available Ollama models
   * @returns Array of model information objects
   */
  public async listModels(): Promise<{ name: string }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error communicating with Ollama API: ${errorMessage}`);
    }
  }

  /**
   * Chat with an Ollama model using streaming API
   * @param modelName Name of the Ollama model to use
   * @param message User message
   * @param onChunk Callback for each text chunk received from the API
   * @param onComplete Callback when the streaming is complete
   */
  public async chatWithModel(
    modelName: string,
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { 
              role: 'system', 
              content: 'You are KOTA, a Knowledge Oriented Thinking Assistant. You provide helpful, accurate, and concise answers.' 
            },
            { role: 'user', content: message }
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to chat: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Read the stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        // Parse the chunk as JSON
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message && data.message.content) {
              onChunk(data.message.content);
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }

      onComplete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error communicating with Ollama API: ${errorMessage}`);
    }
  }
}
