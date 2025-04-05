import { AnthropicService } from './anthropicService.js';
import { OllamaService } from './ollamaService.js';

/**
 * Enum for supported model providers
 */
export enum ModelProvider {
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama',
}

/**
 * Model configuration interface
 */
export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  default?: boolean;
}

/**
 * Current active model configuration
 */
let activeModel: ModelConfig = {
  id: 'claude-3-sonnet-20240229',
  name: 'Claude 3 Sonnet',
  provider: ModelProvider.ANTHROPIC,
  default: true,
};

// Flag to track if we've checked for API keys
let hasCheckedEnvironment = false;

// Default model configurations
const defaultModels: ModelConfig[] = [
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: ModelProvider.ANTHROPIC,
    default: true,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: ModelProvider.ANTHROPIC,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: ModelProvider.ANTHROPIC,
  },
  {
    id: 'llama3:latest',
    name: 'Llama 3 (Ollama)',
    provider: ModelProvider.OLLAMA,
  },
];

/**
 * Check environment and adjust available models
 */
function checkEnvironmentAndAdjustModels(): void {
  if (hasCheckedEnvironment) return;

  // Check for Anthropic API key
  if (!process.env.ANTHROPIC_API_KEY) {
    // If no Anthropic API key, switch default to Ollama if available
    const ollamaDefault = defaultModels.find(
      (m) => m.provider === ModelProvider.OLLAMA
    );
    if (ollamaDefault) {
      ollamaDefault.default = true;
      // Update active model to use Ollama
      activeModel = ollamaDefault;

      // Remove default flag from Anthropic models
      defaultModels.forEach((m) => {
        if (m.provider === ModelProvider.ANTHROPIC) {
          m.default = false;
        }
      });
    }
  }

  hasCheckedEnvironment = true;
}

/**
 * Get all available models (both statically defined and dynamically from services)
 */
export async function getAvailableModels(): Promise<ModelConfig[]> {
  // Check environment variables and adjust models accordingly
  checkEnvironmentAndAdjustModels();

  const models = [...defaultModels];
  let ollamaAvailable = false;

  try {
    // Try to get Ollama models with a timeout
    const ollamaService = OllamaService.getInstance();
    const ollamaModels = await ollamaService.listModels();
    ollamaAvailable = true;

    // Only add Ollama models that aren't already in the default list
    for (const model of ollamaModels) {
      if (
        !models.some(
          (m) => m.provider === ModelProvider.OLLAMA && m.id === model.name
        )
      ) {
        models.push({
          id: model.name,
          name: `${model.name} (Ollama)`,
          provider: ModelProvider.OLLAMA,
        });
      }
    }
  } catch (error) {
    // Ignore errors from Ollama API, just use default models
    console.error('Warning: Failed to fetch Ollama models:', error);
  }

  // If no API key for Anthropic and Ollama is not available, add a warning model
  if (!process.env.ANTHROPIC_API_KEY && !ollamaAvailable) {
    models.push({
      id: 'no-models-available',
      name: 'NO MODELS AVAILABLE - Set ANTHROPIC_API_KEY or start Ollama',
      provider: ModelProvider.ANTHROPIC,
      default: true,
    });

    // Update active model to show the warning
    activeModel = models[models.length - 1];
  }

  return models;
}

/**
 * Get the current active model
 */
export function getActiveModel(): ModelConfig {
  return activeModel;
}

/**
 * Set the active model by ID
 */
export function setActiveModel(modelId: string): boolean {
  // Look in default models first
  const model = defaultModels.find((m) => m.id === modelId);
  if (model) {
    activeModel = model;
    return true;
  }

  // If not found in defaults, maybe it's a dynamic model like from Ollama
  if (modelId.includes(':')) {
    // Heuristic for Ollama models like "llama3:latest"
    activeModel = {
      id: modelId,
      name: modelId,
      provider: ModelProvider.OLLAMA,
    };
    return true;
  }

  return false;
}

/**
 * List available models
 */
export async function listModels(): Promise<void> {
  try {
    const models = await getAvailableModels();
    console.log('Available models:');
    models.forEach((model) => {
      console.log(`- ${model.id}${model.default ? ' (default)' : ''}`);
      console.log(`  Name: ${model.name}`);
      console.log(`  Provider: ${model.provider}`);
    });
    console.log(
      `\nCurrent active model: ${activeModel.id} (${activeModel.name})`
    );
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

/**
 * Handle chat with the appropriate service based on model provider
 */
export async function chatWithModel(
  message: string,
  modelConfig: ModelConfig = activeModel,
  onChunk?: (chunk: string) => void,
  onComplete?: () => void
): Promise<void> {
  try {
    // Check if this is the warning model
    if (modelConfig.id === 'no-models-available') {
      const errorMessage =
        'No AI models are available. Please set ANTHROPIC_API_KEY environment variable or start Ollama service.';
      console.error(errorMessage);
      if (onChunk) onChunk(errorMessage);
      if (onComplete) onComplete();
      return;
    }

    console.log('AI: Thinking...');
    let responseAccumulator = '';

    const defaultOnChunk = (chunk: string) => {
      responseAccumulator += chunk;
    };

    const defaultOnComplete = () => {
      console.log(`AI: ${responseAccumulator}`);
    };

    // Use provided callbacks or defaults
    const chunkHandler = onChunk || defaultOnChunk;
    const completeHandler = onComplete || defaultOnComplete;

    switch (modelConfig.provider) {
      case ModelProvider.ANTHROPIC: {
        if (!process.env.ANTHROPIC_API_KEY) {
          const errorMessage =
            'ANTHROPIC_API_KEY environment variable is not set. Please set it to use Anthropic models.';
          chunkHandler(errorMessage);
          completeHandler();
          return;
        }
        const anthropicService = AnthropicService.getInstance();
        await anthropicService.chatWithAI(
          message,
          chunkHandler,
          completeHandler
        );
        break;
      }
      case ModelProvider.OLLAMA: {
        const ollamaService = OllamaService.getInstance();
        try {
          await ollamaService.chatWithModel(
            modelConfig.id,
            message,
            chunkHandler,
            completeHandler
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          chunkHandler(`Error: ${errorMessage}`);
          completeHandler();
        }
        break;
      }
      default:
        throw new Error(`Unsupported model provider: ${modelConfig.provider}`);
    }
  } catch (error) {
    console.error('Error communicating with AI:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (onChunk) onChunk(`Error: ${errorMessage}`);
    if (onComplete) onComplete();
  }
}
