# KOTA AI - Knowledge Oriented Thinking Assistant

A flexible npm package for AI chat interactions and MCP (Model Context Protocol) server management.

## Installation

```bash
npm install @jayminwest/kota-ai
```

## Features

- **Modular Chatbot Interface**: Create AI-powered chatbots with minimal code
- **MCP Server Management**: Start, stop, and manage MCP servers with ease
- **Flexible AI Model Integration**: Currently supports Anthropic Claude models, with a modular design to add more providers
- **Terminal UI**: Built-in terminal interface using blessed
- **Command Line Interface**: Use KOTA AI from the terminal with the `kota` command

## Usage

### As a Library

#### Basic Chatbot

```javascript
import { createChatbot } from '@jayminwest/kota-ai';

// Create a chatbot with default settings
const { chatbot, aiProvider } = createChatbot({
  apiKey: 'your-anthropic-api-key', // Or set ANTHROPIC_API_KEY env variable
  systemMessage: 'You are a helpful assistant.',
});

// Send a message and get a response
const response = await chatbot.sendMessage('Hello, how are you today?');
console.log('Assistant:', response);
```

#### With MCP Server

```javascript
import { createChatbot } from '@jayminwest/kota-ai';

// Create a chatbot with MCP server
const { chatbot, mcpManager } = createChatbot({
  apiKey: 'your-anthropic-api-key',
  mcpPath: '/path/to/mcp/server',
  autoRestartMcp: true,
});

// Connect to the MCP server
await mcpManager.connect();

// Send a message
const response = await chatbot.sendMessage('What can you do with MCP?');
console.log('Assistant:', response);

// Execute a command through MCP
const result = await chatbot.executeCommand('some-mcp-command');
console.log('Command result:', result);

// Disconnect when done
mcpManager.disconnect();
```

#### Streaming Responses

```javascript
import { createChatbot } from '@jayminwest/kota-ai';

const { chatbot } = createChatbot({
  apiKey: 'your-anthropic-api-key',
});

// Stream the response as it's generated
await chatbot.sendMessage(
  'Explain quantum computing in simple terms',
  (chunk) => {
    process.stdout.write(chunk);
  }
);
```

### Terminal Interface

```javascript
import { createTerminalChatbot } from '@jayminwest/kota-ai';

// Create a terminal-based chatbot
const { terminal } = createTerminalChatbot({
  apiKey: 'your-anthropic-api-key',
  title: 'My Custom Chatbot',
  systemMessage: 'You are a helpful assistant.',
});

// Start the terminal interface
terminal.start();
```

### Command Line

Once installed, you can use the `kota` command:

```bash
# Start the interactive terminal interface
kota

# Chat with KOTA from the command line
kota chat "What's the weather like today?"

# Manage MCP servers
kota mcp connect /path/to/mcp/server
kota mcp disconnect
kota mcp status
```

## API Reference

### Core Modules

- **ChatbotInterface**: Central component for chat interactions
- **AnthropicProvider**: Implementation of AIModelProvider for Anthropic models
- **MCPManager**: Manages MCP server processes
- **TerminalInterface**: Blessed-based terminal UI

### Factory Functions

- **createChatbot(options)**: Creates a chatbot with the specified options
- **createTerminalChatbot(options)**: Creates a terminal-based chatbot UI

## Development

```bash
# Clone the repository
git clone https://github.com/jayminwest/kota-ai.git
cd kota-ai

# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI locally
node dist/cli.js
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

MIT
