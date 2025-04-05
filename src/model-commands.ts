import { ModelConfigLoader } from './config/model-config-loader.js';
import { AnthropicService } from './anthropicService.js';

/**
 * List all available models
 */
export async function listModels(): Promise<void> {
  const configLoader = new ModelConfigLoader();
  const models = configLoader.getModels();
  
  if (models.length === 0) {
    console.log('No models configured. Please check your config/models.yaml file.');
    return;
  }
  
  console.log('Available models:');
  models.forEach(model => {
    const defaultTag = model.default ? ' (default)' : '';
    console.log(`- ${model.name}${defaultTag}`);
    console.log(`  ID: ${model.id}`);
    console.log(`  Provider: ${model.provider}`);
    console.log(`  Description: ${model.description}`);
    console.log(`  Parameters:`);
    console.log(`    - Temperature: ${model.parameters.temperature}`);
    console.log(`    - Max Tokens: ${model.parameters.max_tokens}`);
    console.log();
  });
}

/**
 * Show current model information
 */
export async function showCurrentModel(): Promise<void> {
  try {
    const anthropicService = AnthropicService.getInstance();
    const currentModel = anthropicService.getCurrentModel();
    
    if (!currentModel) {
      console.log('No current model set.');
      return;
    }
    
    console.log(`Current model: ${currentModel.name}`);
    console.log(`ID: ${currentModel.id}`);
    console.log(`Provider: ${currentModel.provider}`);
    console.log(`Description: ${currentModel.description}`);
    console.log('Parameters:');
    console.log(`  - Temperature: ${currentModel.parameters.temperature}`);
    console.log(`  - Max Tokens: ${currentModel.parameters.max_tokens}`);
  } catch (error) {
    console.error('Error getting current model:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Set the default model
 * @param modelId ID of the model to set as default
 */
export async function setDefaultModel(modelId: string): Promise<void> {
  const configLoader = new ModelConfigLoader();
  
  // First check if the model exists
  const model = configLoader.getModelById(modelId);
  if (!model) {
    console.error(`Model with ID "${modelId}" not found.`);
    return;
  }
  
  // Set the model as default
  const success = configLoader.setDefaultModel(modelId);
  if (success) {
    console.log(`Set "${model.name}" as the default model.`);
    
    // If it's an Anthropic model, update the current service instance
    if (model.provider === 'anthropic') {
      try {
        const anthropicService = AnthropicService.getInstance();
        anthropicService.setCurrentModel(modelId);
      } catch (error) {
        // Silently ignore errors getting the Anthropic service
        // This allows the command to work even if the API key isn't set
      }
    }
  } else {
    console.error(`Failed to set "${model.name}" as the default model.`);
  }
}

/**
 * Set the current model (temporary, not persistent)
 * @param modelId ID of the model to use
 */
export async function setCurrentModel(modelId: string): Promise<void> {
  const configLoader = new ModelConfigLoader();
  
  // First check if the model exists
  const model = configLoader.getModelById(modelId);
  if (!model) {
    console.error(`Model with ID "${modelId}" not found.`);
    return;
  }
  
  // Currently only Anthropic models are supported
  if (model.provider !== 'anthropic') {
    console.error(`Models from provider "${model.provider}" are not currently supported.`);
    return;
  }
  
  try {
    const anthropicService = AnthropicService.getInstance();
    const success = anthropicService.setCurrentModel(modelId);
    
    if (success) {
      console.log(`Set current model to "${model.name}".`);
    } else {
      console.error(`Failed to set current model to "${model.name}".`);
    }
  } catch (error) {
    console.error('Error setting current model:', error instanceof Error ? error.message : String(error));
  }
}
