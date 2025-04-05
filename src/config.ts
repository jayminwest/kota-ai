import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * Interface for chat interface styling configuration
 */
export interface ChatInterfaceConfig {
  colors: {
    border: string;
    userMessage: string;
    assistantMessage: string;
    systemMessage: string;
    statusBar: {
      foreground: string;
      background: string;
    };
  };
  layout: {
    chatBoxHeight: string;
    inputBoxHeight: number;
    scrollbarStyle: {
      trackBg: string;
    };
  };
  labels: {
    user: string;
    assistant: string;
    system: string;
    statusBar: string;
  };
}

/**
 * Default configuration values for the chat interface
 */
export const DEFAULT_CHAT_CONFIG: ChatInterfaceConfig = {
  colors: {
    border: 'blue',
    userMessage: 'white',
    assistantMessage: 'green',
    systemMessage: 'yellow',
    statusBar: {
      foreground: 'white',
      background: 'blue',
    },
  },
  layout: {
    chatBoxHeight: '90%',
    inputBoxHeight: 3,
    scrollbarStyle: {
      trackBg: 'gray',
    },
  },
  labels: {
    user: 'You',
    assistant: 'KOTA AI',
    system: 'System',
    statusBar:
      '{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history',
  },
};

/**
 * Get the user's home directory path
 */
export function getUserHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || '.';
}

/**
 * Get the configuration directory path
 */
export function getConfigDir(): string {
  return path.join(getUserHomeDir(), '.kota');
}

/**
 * Ensure the configuration directory exists
 */
export function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Get the possible configuration file paths
 */
export function getConfigFilePaths(): string[] {
  const configDir = getConfigDir();
  return [
    path.join(configDir, 'chat-config.yaml'),
    path.join(configDir, 'chat-config.yml'),
    path.join(configDir, 'chat-config.json'),
    path.join(process.cwd(), 'chat-config.yaml'),
    path.join(process.cwd(), 'chat-config.yml'),
    path.join(process.cwd(), 'chat-config.json'),
  ];
}

/**
 * Loads a configuration file from various possible locations,
 * supporting both YAML and JSON formats
 */
export function loadChatConfig(): ChatInterfaceConfig {
  const configPaths = getConfigFilePaths();

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const fileExt = path.extname(configPath).toLowerCase();

        let loadedConfig: Partial<ChatInterfaceConfig>;

        // Parse the file based on its extension
        if (fileExt === '.json') {
          loadedConfig = JSON.parse(fileContent);
        } else if (fileExt === '.yaml' || fileExt === '.yml') {
          loadedConfig = yaml.load(fileContent) as Partial<ChatInterfaceConfig>;
        } else {
          console.error(`Unsupported config file extension: ${fileExt}`);
          continue;
        }

        // Merge with default config to ensure all values are present
        console.log(`Loaded chat configuration from ${configPath}`);
        return mergeWithDefault(loadedConfig);
      } catch (error) {
        console.error(`Error loading config from ${configPath}:`, error);
      }
    }
  }

  // If no config file is found or valid, use default config
  console.log('Using default chat configuration');
  return DEFAULT_CHAT_CONFIG;
}

/**
 * Create a default configuration file if none exists
 */
export function createDefaultConfigFile(
  format: 'yaml' | 'json' = 'yaml'
): string {
  ensureConfigDir();
  const configDir = getConfigDir();
  const fileName = format === 'yaml' ? 'chat-config.yaml' : 'chat-config.json';
  const filePath = path.join(configDir, fileName);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  try {
    let content: string;
    if (format === 'yaml') {
      content = yaml.dump(DEFAULT_CHAT_CONFIG, { lineWidth: 100 });
    } else {
      content = JSON.stringify(DEFAULT_CHAT_CONFIG, null, 2);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created default chat configuration at ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Error creating default config file:`, error);
    throw error;
  }
}

/**
 * Merge user configuration with the default configuration
 */
function mergeWithDefault(
  userConfig: Partial<ChatInterfaceConfig>
): ChatInterfaceConfig {
  return {
    colors: {
      border: userConfig.colors?.border ?? DEFAULT_CHAT_CONFIG.colors.border,
      userMessage:
        userConfig.colors?.userMessage ??
        DEFAULT_CHAT_CONFIG.colors.userMessage,
      assistantMessage:
        userConfig.colors?.assistantMessage ??
        DEFAULT_CHAT_CONFIG.colors.assistantMessage,
      systemMessage:
        userConfig.colors?.systemMessage ??
        DEFAULT_CHAT_CONFIG.colors.systemMessage,
      statusBar: {
        foreground:
          userConfig.colors?.statusBar?.foreground ??
          DEFAULT_CHAT_CONFIG.colors.statusBar.foreground,
        background:
          userConfig.colors?.statusBar?.background ??
          DEFAULT_CHAT_CONFIG.colors.statusBar.background,
      },
    },
    layout: {
      chatBoxHeight:
        userConfig.layout?.chatBoxHeight ??
        DEFAULT_CHAT_CONFIG.layout.chatBoxHeight,
      inputBoxHeight:
        userConfig.layout?.inputBoxHeight ??
        DEFAULT_CHAT_CONFIG.layout.inputBoxHeight,
      scrollbarStyle: {
        trackBg:
          userConfig.layout?.scrollbarStyle?.trackBg ??
          DEFAULT_CHAT_CONFIG.layout.scrollbarStyle.trackBg,
      },
    },
    labels: {
      user: userConfig.labels?.user ?? DEFAULT_CHAT_CONFIG.labels.user,
      assistant:
        userConfig.labels?.assistant ?? DEFAULT_CHAT_CONFIG.labels.assistant,
      system: userConfig.labels?.system ?? DEFAULT_CHAT_CONFIG.labels.system,
      statusBar:
        userConfig.labels?.statusBar ?? DEFAULT_CHAT_CONFIG.labels.statusBar,
    },
  };
}
