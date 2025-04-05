/**
 * Interface for model parameters used in API calls
 */
export interface ModelParameters {
  temperature: number;
  max_tokens: number;
  system?: string;
  [key: string]: any; // Allow for additional provider-specific parameters
}

/**
 * Interface for a single model configuration
 */
export interface ModelConfig {
  id: string;
  provider: string;
  name: string;
  description: string;
  parameters: ModelParameters;
  default: boolean;
}

/**
 * Interface for the entire models configuration file
 */
export interface ModelsConfig {
  models: ModelConfig[];
}
