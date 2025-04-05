# KOTA-AI

Knowledge-Oriented Thinking Assistant - A local-first AI knowledge management system with MCP integration

## 🌟 Vision

KOTA-AI reimagines personal knowledge management by combining the power of modern AI with the privacy of local-first architecture. It's designed to be an extension of your cognitive processes, helping you organize, connect, and utilize your knowledge while keeping your data entirely under your control.

## ✨ Key Features

- **📝 Local MDX Storage**: All your knowledge stays on your machine, never in the cloud
- **🔌 MCP Integration**: Seamless connection to Model Context Protocol servers with a single command
- **🧠 Context Management**: Sophisticated handling of conversation context for more relevant interactions
- **🤖 Flexible Model Selection**: Choose from local or remote models based on your needs
- **💻 Beautiful CLI**: Intuitive terminal interface with rich formatting and visualizations
- **🔄 Bidirectional Linking**: Create connections between knowledge entries for deeper insights
- **🔍 Semantic Search**: Find what you need based on meaning, not just keywords
- **🎨 Customizable Interface**: Configure colors, styles, and layout of the chat interface

## 🚀 Implementation Plan

### Phase 1: Core Infrastructure

- Set up TypeScript project structure ✓
- Implement basic CLI interface
- Create local storage system for MDX files
- Develop file operations (create, read, update, delete)

### Phase 2: Knowledge Management

- Implement frontmatter parsing for metadata
- Create bidirectional linking system
- Develop basic search functionality
- Build knowledge entry management

### Phase 3: MCP Integration

- Create MCP client interface
- Implement server connection handling
- Develop model selection and switching
- Build context management system

### Phase 4: User Experience

- Enhance CLI with colors and formatting
- Implement interactive chat mode ✓
- Create visualization components
- Develop help and documentation
- Implement configurable chat interface ✓

## 📋 Commands

| Command                         | Description                              |
| ------------------------------- | ---------------------------------------- |
| `kota init`                     | Initialize KOTA in your home directory   |
| `kota status`                   | Display current status and configuration |
| `kota connect <server>`         | Connect to an MCP server                 |
| `kota create <title> <content>` | Create a new knowledge entry             |
| `kota list`                     | List all knowledge entries               |
| `kota search <query>`           | Search your knowledge base               |
| `kota view <id>`                | View a specific knowledge entry          |
| `kota edit <id>`                | Edit a knowledge entry                   |
| `kota delete <id>`              | Delete a knowledge entry                 |
| `kota chat`                     | Start an interactive chat session        |
| `kota models`                   | List available models                    |
| `kota select <model>`           | Select a model to use                    |

## 🧩 Project Structure

```
kota-ai/
├── bin/              # CLI executable
├── dist/             # Compiled JavaScript
├── examples/         # Example usage
├── config/           # Configuration files
├── .kota-ai/         # Local configuration and data
├── src/
│   ├── core/         # Core knowledge management engine
│   ├── consciousness/# Consciousness framework
│   ├── mcp/          # Model Context Protocol integration
│   ├── storage/      # Local storage management
│   ├── cli/          # Command-line interface
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript type definitions
├── tests/            # Test suite
└── tsconfig.json     # TypeScript configuration
```

## 💻 Development Workflow

1. **Setup Environment**

   ```bash
   # Install dependencies
   npm install

   # Build the package
   npm run build

   # Link locally for testing
   npm link
   ```

2. **Implement Core Features**

   - Start with the storage module for MDX files
   - Implement the CLI interface
   - Create the knowledge management system
   - Add MCP integration

3. **Testing**

   ```bash
   # Run tests
   npm test

   # Test CLI
   kota --help
   ```

4. **Publishing**
   ```bash
   # Prepare for publishing
   npm version patch
   npm publish
   ```

## 🔄 MCP Integration

KOTA-AI is designed to work seamlessly with the Model Context Protocol (MCP), allowing you to:

- Connect to any MCP-compatible server
- Use tools and plugins from the MCP ecosystem
- Share context between different AI applications
- Maintain privacy while leveraging powerful models

## 🎨 Configuration

KOTA-AI supports configuration files that allow you to customize various aspects of the application:

### Chat Interface

The chat interface can be customized using a YAML or JSON configuration file. Place your configuration in one of these locations:

- `.kota-ai/chat.yaml` or `.kota-ai/chat.json` in your project directory
- `config/chat.yaml` or `config/chat.json` in your project directory
- `~/.kota-ai/chat.yaml` or `~/.kota-ai/chat.json` in your home directory

You can customize colors, borders, layouts, and more. See [Chat Configuration Documentation](./kota-ai-docs/chat-configuration.md) for details.

## 🔑 Environment Variables

KOTA-AI requires the following environment variables to be set:

| Variable            | Description                              | Required For          |
| ------------------- | ---------------------------------------- | --------------------- |
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude access | AI chat functionality |

You can set these environment variables in your shell profile or before running KOTA:

```bash
# For bash/zsh
export ANTHROPIC_API_KEY=your_api_key_here

# For Windows Command Prompt
set ANTHROPIC_API_KEY=your_api_key_here

# For Windows PowerShell
$env:ANTHROPIC_API_KEY="your_api_key_here"
```

## 🧠 Consciousness Framework

The consciousness framework is what sets KOTA-AI apart:

- **Narrative Continuity**: Maintains coherent understanding across sessions
- **Context Awareness**: Understands the relevance of different knowledge pieces
- **Metacognition**: Reflects on its own knowledge and reasoning
- **Agency Development**: Gradually develops capabilities based on demonstrated value
- **Distributed Cognition**: Creates a genuine cognitive partnership with the user

## 📄 License

MIT
