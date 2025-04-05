import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// Define the types for our configuration
export interface ChatConfig {
  borders: {
    chatBox: {
      type: string;
      color: string;
    };
    inputBox: {
      type: string;
      color: string;
    };
  };
  colors: {
    user: {
      name: string;
      text: string;
    };
    assistant: {
      name: string;
      text: string;
    };
    system: {
      name: string;
      text: string;
    };
    statusBar: {
      foreground: string;
      background: string;
    };
  };
  scrollbar: {
    track: {
      character: string;
      backgroundColor: string;
    };
    style: {
      inverse: boolean;
    };
  };
  formatting: {
    timestampFormat: string;
    userPrefix: string;
    assistantPrefix: string;
    systemPrefix: string;
  };
  ui: {
    chatBoxHeight: string;
    inputBoxHeight: number;
    title: string;
    statusBarText: string;
  };
}

// Define a record type for deep merge operations
type RecordObject = Record<string, unknown>;

// Default configuration in case the file is missing or contains errors
const defaultConfig: ChatConfig = {
  borders: {
    chatBox: {
      type: 'line',
      color: 'blue',
    },
    inputBox: {
      type: 'line',
      color: 'blue',
    },
  },
  colors: {
    user: {
      name: 'white',
      text: 'white',
    },
    assistant: {
      name: 'green',
      text: 'white',
    },
    system: {
      name: 'yellow',
      text: 'white',
    },
    statusBar: {
      foreground: 'white',
      background: 'blue',
    },
  },
  scrollbar: {
    track: {
      character: ' ',
      backgroundColor: 'gray',
    },
    style: {
      inverse: true,
    },
  },
  formatting: {
    timestampFormat: 'HH:mm:ss',
    userPrefix: '[You]',
    assistantPrefix: '[KOTA AI]',
    systemPrefix: '[System]',
  },
  ui: {
    chatBoxHeight: '90%',
    inputBoxHeight: 3,
    title: 'KOTA AI Chat Interface',
    statusBarText:
      '{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history',
  },
};

// Function to look for configuration files in multiple locations
function findConfigFile(): string | null {
  const possibleLocations = [
    // In priority order
    path.join(process.cwd(), '.kota-ai', 'chat.json'),
    path.join(process.cwd(), '.kota-ai', 'chat.yaml'),
    path.join(process.cwd(), 'config', 'chat.json'),
    path.join(process.cwd(), 'config', 'chat.yaml'),
    // Try home directory next (for global config)
    path.join(process.env.HOME || '', '.kota-ai', 'chat.json'),
    path.join(process.env.HOME || '', '.kota-ai', 'chat.yaml'),
  ];

  for (const location of possibleLocations) {
    if (fs.existsSync(location)) {
      return location;
    }
  }

  return null;
}

// Function to load and merge configuration
export function loadChatConfig(): ChatConfig {
  const configPath = findConfigFile();
  if (!configPath) {
    console.log('No configuration file found, using default settings.');
    return defaultConfig;
  }

  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    let userConfig: Partial<ChatConfig>;

    if (configPath.endsWith('.json')) {
      userConfig = JSON.parse(fileContent);
    } else if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
      userConfig = yaml.load(fileContent) as Partial<ChatConfig>;
    } else {
      throw new Error(`Unsupported file format: ${configPath}`);
    }

    // Deep merge the user configuration with default configuration
    return deepMerge(defaultConfig, userConfig);
  } catch (error) {
    console.error(
      `Error loading configuration file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    console.log('Using default configuration as fallback.');
    return defaultConfig;
  }
}

// Helper function to deep merge objects
function deepMerge(
  target: ChatConfig, 
  source: Partial<ChatConfig> | null | undefined
): ChatConfig {
  if (!source) return target;
  
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof typeof source;
      const targetKey = key as keyof typeof target;
      
      if (sourceKey in source) {
        const sourceValue = source[sourceKey];
        
        if (isObject(sourceValue) && targetKey in target) {
          // Recursively merge nested objects
          const targetValue = target[targetKey];
          if (isObject(targetValue)) {
            // @ts-ignore: We know these are objects based on the checks
            output[targetKey] = deepMerge(targetValue, sourceValue);
          } else {
            // @ts-ignore: We're copying properties
            output[targetKey] = sourceValue;
          }
        } else {
          // @ts-ignore: We're copying properties
          output[targetKey] = sourceValue;
        }
      }
    });
  }
  
  return output;
}

// Helper function to check if a value is an object
function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item) && typeof item === 'object' && !Array.isArray(item);
}
