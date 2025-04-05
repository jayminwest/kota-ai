import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ModelConfig, ModelsConfig } from '../types/model-config.js';

/**
 * Class responsible for loading and managing model configurations
 */
export class ModelConfigLoader {
  private configPath: string;
  private config: ModelsConfig | null = null;

  /**
   * Creates a new ModelConfigLoader instance
   * @param configPath Path to the YAML configuration file
   */
  constructor(configPath: string = 'config/models.yaml') {
    this.configPath = configPath;
  }

  /**
   * Loads the model configuration from YAML file
   * @returns The loaded model configuration
   */
  public load(): ModelsConfig {
    if (!this.config) {
      try {
        // Use the full path for the file
        const fullPath = path.resolve(process.cwd(), this.configPath);
        
        if (!fs.existsSync(fullPath)) {
          console.warn(`Model configuration file not found: ${fullPath}`);
          this.config = { models: [] };
          return this.config;
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        this.config = yaml.load(fileContents) as ModelsConfig;
        
        // Validate the configuration
        this.validateConfig();
      } catch (error) {
        console.error('Failed to load model configuration:', error);
        this.config = { models: [] };
      }
    }
    return this.config;
  }

  /**
   * Validates the loaded configuration and ensures there's exactly one default model
   */
  private validateConfig(): void {
    if (!this.config) return;

    // Ensure there are models
    if (!this.config.models || !Array.isArray(this.config.models)) {
      this.config.models = [];
      return;
    }

    // Check for default models
    const defaultModels = this.config.models.filter(model => model.default);
    
    if (defaultModels.length === 0 && this.config.models.length > 0) {
      // If no default model is specified, set the first one as default
      console.warn('No default model specified, setting the first model as default');
      this.config.models[0].default = true;
    } else if (defaultModels.length > 1) {
      // If multiple default models, keep only the first one as default
      console.warn('Multiple default models found, using the first one');
      defaultModels.forEach((model, index) => {
        if (index > 0) {
          model.default = false;
        }
      });
    }
  }

  /**
   * Gets all configured models
   * @returns Array of model configurations
   */
  public getModels(): ModelConfig[] {
    return this.load().models;
  }

  /**
   * Gets a model by its ID
   * @param id The model ID to look for
   * @returns The model configuration or undefined if not found
   */
  public getModelById(id: string): ModelConfig | undefined {
    return this.getModels().find(model => model.id === id);
  }

  /**
   * Gets the default model
   * @returns The default model configuration or undefined if none
   */
  public getDefaultModel(): ModelConfig | undefined {
    return this.getModels().find(model => model.default);
  }

  /**
   * Gets all models for a specific provider
   * @param provider The provider name (e.g., 'anthropic', 'openai')
   * @returns Array of models for the specified provider
   */
  public getModelsByProvider(provider: string): ModelConfig[] {
    return this.getModels().filter(model => model.provider === provider);
  }

  /**
   * Sets a model as the default model
   * @param id The ID of the model to set as default
   * @returns True if successful, false if the model wasn't found
   */
  public setDefaultModel(id: string): boolean {
    const models = this.getModels();
    const modelToSetAsDefault = models.find(model => model.id === id);
    
    if (!modelToSetAsDefault) {
      return false;
    }

    // Set all models to non-default
    models.forEach(model => {
      model.default = false;
    });

    // Set the selected model as default
    modelToSetAsDefault.default = true;

    // Save the updated configuration
    this.saveConfig();
    
    return true;
  }

  /**
   * Saves the current configuration back to the YAML file
   */
  private saveConfig(): void {
    if (!this.config) {
      return;
    }

    try {
      const fullPath = path.resolve(process.cwd(), this.configPath);
      const yamlStr = yaml.dump(this.config);
      fs.writeFileSync(fullPath, yamlStr, 'utf8');
    } catch (error) {
      console.error('Failed to save model configuration:', error);
    }
  }
}
