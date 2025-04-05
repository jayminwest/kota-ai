import blessed from 'blessed';
import {
  chatWithModel,
  getActiveModel,
  listModels,
  setActiveModel,
  ModelConfig,
  ModelProvider,
  getAvailableModels,
} from './model-commands.js';
import { MCPManager } from './mcpManager.js';
import { loadChatConfig, ChatInterfaceConfig } from './config.js';

export class PersistentChatInterface {
  private screen: blessed.Widgets.Screen;
  private chatBox: blessed.Widgets.BoxElement;
  private inputBox: blessed.Widgets.TextareaElement;
  private statusBar: blessed.Widgets.BoxElement;
  private chatHistory: { role: 'user' | 'ai'; content: string }[] = [];
  private isProcessing = false;
  private availableModels: ModelConfig[] = [];
  private mcpManager: MCPManager = MCPManager.getInstance();
  private config: ChatInterfaceConfig;
  private exitConfirmationBox: blessed.Widgets.BoxElement | null = null;
  private modelSelectionBox: blessed.Widgets.ListElement | null = null;

  constructor() {
    // Load configuration
    this.config = loadChatConfig();

    // Initialize blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'KOTA - Knowledge Oriented Thinking Assistant',
    });

    // Create chat box for displaying conversation
    this.chatBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: this.config.layout.chatBoxHeight || '90%',
      scrollable: true,
      alwaysScroll: true,
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: this.config.colors.border || 'blue',
        },
      },
    });

    // Create input box for user messages
    this.inputBox = blessed.textarea({
      bottom: 1,
      left: 0,
      width: '100%',
      height: this.config.layout.inputBoxHeight || '10%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: this.config.colors.border || 'blue',
        },
      },
      inputOnFocus: true,
    });

    // Create status bar
    this.statusBar = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      content:
        ' Press Ctrl+C or type /exit to exit, Ctrl+M to change model, ESC for menu',
      tags: true,
      style: {
        fg: this.config.colors.statusBar.foreground || 'white',
        bg: this.config.colors.statusBar.background || 'blue',
      },
    });

    // Add elements to screen
    this.screen.append(this.chatBox);
    this.screen.append(this.inputBox);
    this.screen.append(this.statusBar);

    // Add multiple exit methods
    this.setupExitHandlers();

    // Setup model selection shortcut
    this.screen.key(['C-m'], () => {
      this.showModelSelection();
    });

    // Setup MCP connection information shortcut
    this.screen.key(['C-p'], () => {
      this.showMCPInfoBox();
    });

    this.inputBox.key('enter', async () => {
      await this.handleUserInput();
    });

    // Setup global exception handler
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.cleanupAndExit();
    });

    // Focus input
    this.inputBox.focus();

    // Welcome message
    this.addMessage('ai', 'Welcome to KOTA! How can I help you today?\n\nTips:\n• Press Ctrl+M to select a different AI model\n• Press Ctrl+P to view MCP connection status\n• Type /exit or press ESC and confirm to exit');
    this.updateStatus();
  }

  /**
   * Show MCP connection information
   */
  private showMCPInfoBox(): void {
    const connected = this.mcpManager.isConnected();
    const server = this.mcpManager.getCurrentServer();
    const capabilities = this.mcpManager.getServerCapabilities();

    const infoBox = blessed.box({
      top: 'center',
      left: 'center',
      width: '70%',
      height: '70%',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'white',
        },
        scrollbar: {
          bg: 'blue',
        },
      },
      label: ' MCP Connection Status ',
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
    });

    let content = '';

    if (connected && server) {
      content += `{green-fg}✓ Connected{/green-fg} to MCP server: ${server.displayName || server.name}\n\n`;
      
      if (capabilities) {
        content += 'Server capabilities:\n';
        content += `• Protocol version: ${capabilities.version}\n`;
        content += `• Server name: ${capabilities.serverInfo?.name || 'Unknown'}\n`;
        content += `• Server version: ${capabilities.serverInfo?.version || 'Unknown'}\n\n`;

        if (capabilities.supportedFeatures && capabilities.supportedFeatures.length > 0) {
          content += 'Supported features:\n';
          capabilities.supportedFeatures.forEach((feature: string) => {
            content += `• ${feature}\n`;
          });
          content += '\n';
        }

        if (capabilities.supportedModels && capabilities.supportedModels.length > 0) {
          content += 'Supported models:\n';
          capabilities.supportedModels.forEach((model: any) => {
            content += `• ${model.id} (${model.name || 'Unnamed'})\n`;
          });
        }
      }
    } else {
      content += `{red-fg}✗ Not connected{/red-fg} to any MCP server\n\n`;
      content += 'You can connect to an MCP server from the command line using:\n';
      content += '$ kota mcp connect [server-name]\n\n';
      content += 'To list available servers:\n';
      content += '$ kota mcp list\n\n';
      content += 'For more information about MCP commands:\n';
      content += '$ kota help';
    }

    infoBox.setContent(content);
    
    // Add a close button
    const closeButton = blessed.button({
      parent: infoBox,
      bottom: 1,
      left: 'center',
      width: 10,
      height: 3,
      content: 'Close',
      align: 'center',
      valign: 'middle',
      style: {
        bg: 'blue',
        fg: 'white',
        focus: {
          bg: 'cyan',
        },
        hover: {
          bg: 'cyan',
        },
      },
      border: {
        type: 'line',
      },
    });

    closeButton.on('press', () => {
      this.screen.remove(infoBox);
      this.screen.render();
      this.inputBox.focus();
    });

    // Close on escape
    infoBox.key(['escape', 'q'], () => {
      this.screen.remove(infoBox);
      this.screen.render();
      this.inputBox.focus();
    });

    this.screen.append(infoBox);
    closeButton.focus();
    this.screen.render();
  }

  /**
   * Setup all exit handlers
   */
  private setupExitHandlers(): void {
    // Method 1: Handle CTRL+C via blessed screen
    this.screen.key(['C-c'], () => {
      this.cleanupAndExit();
    });

    // Method 2: Use raw keypress events to catch CTRL+C even if blessed captures it
    this.screen.program.on('keypress', (ch, key) => {
      if (key && key.ctrl && key.name === 'c') {
        this.cleanupAndExit();
      } else if (key && key.name === 'escape') {
        this.showExitConfirmation();
      }
    });

    // Method 3: Process signal handlers
    const exitHandler = () => {
      this.cleanupAndExit();
    };

    process.on('SIGINT', exitHandler);
    process.on('SIGTERM', exitHandler);
  }

  /**
   * Show exit confirmation dialog
   */
  private showExitConfirmation(): void {
    // Don't show confirmation if it's already visible
    if (this.exitConfirmationBox) return;

    // Create confirmation box
    this.exitConfirmationBox = blessed.box({
      top: 'center',
      left: 'center',
      width: '50%',
      height: '30%',
      content: 'Are you sure you want to exit?',
      align: 'center',
      valign: 'middle',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'red',
        },
        bg: 'black',
        fg: 'white',
      },
    });

    // Add buttons
    const yesButton = blessed.button({
      parent: this.exitConfirmationBox,
      bottom: 3,
      left: '25%-10',
      width: 10,
      height: 3,
      content: 'Yes',
      align: 'center',
      valign: 'middle',
      style: {
        bg: 'red',
        fg: 'white',
        focus: {
          bg: 'dark-red',
        },
        hover: {
          bg: 'dark-red',
        },
      },
      border: {
        type: 'line',
      },
    });

    const noButton = blessed.button({
      parent: this.exitConfirmationBox,
      bottom: 3,
      right: '25%-10',
      width: 10,
      height: 3,
      content: 'No',
      align: 'center',
      valign: 'middle',
      style: {
        bg: 'green',
        fg: 'white',
        focus: {
          bg: 'dark-green',
        },
        hover: {
          bg: 'dark-green',
        },
      },
      border: {
        type: 'line',
      },
    });

    // Events
    yesButton.on('press', () => {
      this.cleanupAndExit();
    });

    noButton.on('press', () => {
      this.closeExitConfirmation();
    });

    // Key handling
    this.exitConfirmationBox.key(['y', 'Y'], () => {
      this.cleanupAndExit();
    });

    this.exitConfirmationBox.key(['n', 'N', 'escape'], () => {
      this.closeExitConfirmation();
    });

    // Add to screen and focus
    this.screen.append(this.exitConfirmationBox);
    yesButton.focus();
    this.screen.render();
  }

  /**
   * Close exit confirmation dialog
   */
  private closeExitConfirmation(): void {
    if (this.exitConfirmationBox) {
      this.screen.remove(this.exitConfirmationBox);
      this.exitConfirmationBox = null;
      this.inputBox.focus();
      this.screen.render();
    }
  }

  /**
   * Clean up resources and exit
   */
  private cleanupAndExit(): void {
    try {
      // Ensure MCP server is disconnected
      this.mcpManager.disconnect();

      // Reset terminal state
      this.screen.program.disableMouse();
      this.screen.program.showCursor();
      this.screen.program.normalBuffer();

      // Destroy the screen to restore terminal
      if (this.screen) {
        this.screen.destroy();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      // Force exit regardless of any errors
      console.log('KOTA chat session ended.');
      process.exit(0);
    }
  }

  /**
   * Start the chat interface
   */
  public async start(): Promise<void> {
    // Load available models
    try {
      this.availableModels = await getAvailableModels();
      this.updateStatus();
      this.screen.render();
    } catch (error) {
      this.addMessage('ai', `Error loading models: ${error}`);
    }

    // Render the interface
    this.screen.render();
  }

  /**
   * Add a message to the chat box
   */
  private addMessage(role: 'user' | 'ai', content: string): void {
    // Add to history
    this.chatHistory.push({ role, content });

    // Format and display message
    const prefix =
      role === 'user'
        ? '{green-fg}You:{/green-fg} '
        : '{yellow-fg}AI:{/yellow-fg} ';
    const formattedMessage = prefix + content;

    // Append to chat box
    if (this.chatBox.getContent()) {
      this.chatBox.setContent(
        this.chatBox.getContent() + '\n\n' + formattedMessage
      );
    } else {
      this.chatBox.setContent(formattedMessage);
    }

    // Scroll to bottom
    this.chatBox.setScrollPerc(100);
    this.screen.render();
  }

  /**
   * Update the status bar with current model and MCP info
   */
  private updateStatus(): void {
    const activeModel = getActiveModel();
    let mcpStatus = this.mcpManager.isConnected() ? 
      '{green-fg}MCP Connected{/green-fg}' : 
      '{gray-fg}MCP Disconnected{/gray-fg}';
      
    let statusText = ` Model: ${activeModel.name} | ${mcpStatus} | Ctrl+M: Change Model | Ctrl+P: MCP Info | Ctrl+C/ESC: Exit`;

    // Add warning if no API key is set
    if (
      !process.env.ANTHROPIC_API_KEY &&
      activeModel.provider === ModelProvider.ANTHROPIC
    ) {
      statusText = ` WARNING: No ANTHROPIC_API_KEY set | ${statusText}`;
    }

    this.statusBar.setContent(statusText);
    this.screen.render();
  }

  /**
   * Handle user input from the input box
   */
  private async handleUserInput(): Promise<void> {
    if (this.isProcessing) return;

    const message = this.inputBox.getValue();
    if (!message.trim()) return;

    // Check for exit command
    if (message.trim().toLowerCase() === '/exit') {
      this.cleanupAndExit();
      return;
    }

    // Clear input box
    this.inputBox.setValue('');
    this.screen.render();

    // Display user message
    this.addMessage('user', message);

    this.isProcessing = true;
    // Show thinking message
    this.statusBar.setContent(' AI is thinking...');
    this.screen.render();

    try {
      let response = '';

      await chatWithModel(
        message,
        getActiveModel(),
        (chunk) => {
          // Add to response
          response += chunk;

          // Update chatBox with current response
          const lastMsgIdx = this.chatHistory.length;
          if (
            lastMsgIdx > 0 &&
            this.chatHistory[lastMsgIdx - 1].role === 'ai'
          ) {
            // Update the existing AI message
            this.chatHistory[lastMsgIdx - 1].content = response;
          } else {
            // Add a new AI message
            this.chatHistory.push({ role: 'ai', content: response });
          }

          // Redraw chat
          this.renderChatHistory();
        },
        () => {
          // When complete, add the message to history if not already added
          if (
            this.chatHistory.length === 0 ||
            this.chatHistory[this.chatHistory.length - 1].role !== 'ai'
          ) {
            this.addMessage('ai', response);
          }
          this.isProcessing = false;
          this.updateStatus();
        }
      );
    } catch (error) {
      this.addMessage(
        'ai',
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      this.isProcessing = false;
      this.updateStatus();
    }
  }

  /**
   * Render the entire chat history
   */
  private renderChatHistory(): void {
    let content = '';

    for (const message of this.chatHistory) {
      const prefix =
        message.role === 'user'
          ? '{green-fg}You:{/green-fg} '
          : '{yellow-fg}AI:{/yellow-fg} ';
      if (content) {
        content += '\n\n';
      }
      content += prefix + message.content;
    }

    this.chatBox.setContent(content);
    this.chatBox.setScrollPerc(100);
    this.screen.render();
  }

  /**
   * Show model selection dialog
   */
  private async showModelSelection(): Promise<void> {
    // Close any existing model selection
    if (this.modelSelectionBox) {
      this.screen.remove(this.modelSelectionBox);
      this.modelSelectionBox = null;
    }

    // Create modal list
    this.modelSelectionBox = blessed.list({
      top: 'center',
      left: 'center',
      width: '70%',
      height: '70%',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        selected: {
          bg: 'blue',
          fg: 'white',
          bold: true,
        },
        border: {
          fg: 'white',
        },
        scrollbar: {
          bg: 'blue',
        },
      },
      label: ' Select AI Model ',
      scrollable: true,
      keys: true,
      vi: true,
    });

    // Add a header with instructions
    const header = blessed.box({
      parent: this.modelSelectionBox,
      top: 0,
      left: 0,
      width: '100%-2',
      height: 3,
      content: '{center}Select a model and press Enter, or press Escape to cancel{/center}',
      tags: true,
      style: {
        fg: 'white',
        bg: 'blue',
      },
    });

    // Adjust list position below header
    this.modelSelectionBox.top = 3;
    this.modelSelectionBox.height = '100%-6';

    // Try to refresh models
    try {
      this.availableModels = await getAvailableModels();

      // Group models by provider
      const anthropicModels = this.availableModels.filter(
        model => model.provider === ModelProvider.ANTHROPIC
      );
      const ollamaModels = this.availableModels.filter(
        model => model.provider === ModelProvider.OLLAMA
      );

      // Add models to list with grouping
      const activeModel = getActiveModel();
      let items: string[] = [];

      if (anthropicModels.length > 0) {
        items.push('{bold}─── Anthropic Claude Models ───{/bold}');
        anthropicModels.forEach(model => {
          let label = `  ${model.name}`;
          if (model.id === activeModel.id) {
            label = `  {green-fg}${model.name} ✓{/green-fg}`;
          }
          items.push(label);
        });
      }

      if (ollamaModels.length > 0) {
        items.push('{bold}─── Local Ollama Models ───{/bold}');
        ollamaModels.forEach(model => {
          let label = `  ${model.name}`;
          if (model.id === activeModel.id) {
            label = `  {green-fg}${model.name} ✓{/green-fg}`;
          }
          items.push(label);
        });
      }

      this.modelSelectionBox.setItems(items);

      // Map selection index back to model index
      const modelMap = new Map<number, ModelConfig>();
      let listIndex = 0;
      
      // Skip header items
      anthropicModels.length > 0 && listIndex++;
      anthropicModels.forEach(model => {
        modelMap.set(listIndex++, model);
      });
      
      ollamaModels.length > 0 && listIndex++;
      ollamaModels.forEach(model => {
        modelMap.set(listIndex++, model);
      });

      // Handle selection
      this.modelSelectionBox.on('select', (_, index) => {
        const selectedModel = modelMap.get(index);
        if (selectedModel) {
          setActiveModel(selectedModel.id);
          this.updateStatus();
          this.addMessage('ai', `Model changed to ${selectedModel.name}`);
        }

        // Remove list and render screen
        if (this.modelSelectionBox) {
          this.screen.remove(this.modelSelectionBox);
          this.modelSelectionBox = null;
        }
        this.screen.render();
        this.inputBox.focus();
      });
    } catch (error) {
      console.error('Failed to refresh models:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Show error message in the list
      this.modelSelectionBox.setItems([
        '{red-fg}Error loading models:{/red-fg}',
        `  ${errorMsg}`,
        '',
        '{bold}Press Escape to close{/bold}'
      ]);
    }

    // Handle escape
    this.modelSelectionBox.key(['escape', 'q'], () => {
      if (this.modelSelectionBox) {
        this.screen.remove(this.modelSelectionBox);
        this.modelSelectionBox = null;
      }
      this.screen.render();
      this.inputBox.focus();
    });

    // Add list to screen
    this.screen.append(this.modelSelectionBox);
    this.modelSelectionBox.focus();
    this.screen.render();
  }
}
