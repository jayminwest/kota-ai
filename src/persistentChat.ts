import * as blessed from 'blessed';
import {
  chatWithModel,
  getActiveModel,
  listModels,
  setActiveModel,
  ModelConfig,
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
      content: ' Press Ctrl+C to exit, Ctrl+M to change model',
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

    // Key bindings
    this.screen.key(['C-c'], () => {
      this.cleanupAndExit();
    });

    this.screen.key(['C-m'], () => {
      this.showModelSelection();
    });

    this.inputBox.key('enter', async () => {
      await this.handleUserInput();
    });

    // Focus input
    this.inputBox.focus();

    // Welcome message
    this.addMessage('ai', 'Welcome to KOTA! How can I help you today?');
    this.updateStatus();
  }

  /**
   * Clean up resources and exit
   */
  private cleanupAndExit(): void {
    // Ensure MCP server is disconnected
    this.mcpManager.disconnect();
    process.exit(0);
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
    const prefix = role === 'user' ? '{green-fg}You:{/green-fg} ' : '{yellow-fg}AI:{/yellow-fg} ';
    const formattedMessage = prefix + content;

    // Append to chat box
    if (this.chatBox.getContent()) {
      this.chatBox.setContent(this.chatBox.getContent() + '\n\n' + formattedMessage);
    } else {
      this.chatBox.setContent(formattedMessage);
    }

    // Scroll to bottom
    this.chatBox.setScrollPerc(100);
    this.screen.render();
  }

  /**
   * Update the status bar with current model info
   */
  private updateStatus(): void {
    const activeModel = getActiveModel();
    this.statusBar.setContent(
      ` Model: ${activeModel.name} | Press Ctrl+C to exit, Ctrl+M to change model`
    );
    this.screen.render();
  }

  /**
   * Handle user input from the input box
   */
  private async handleUserInput(): Promise<void> {
    if (this.isProcessing) return;

    const message = this.inputBox.getValue();
    if (!message.trim()) return;

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
          if (lastMsgIdx > 0 && this.chatHistory[lastMsgIdx - 1].role === 'ai') {
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
          if (this.chatHistory.length === 0 || this.chatHistory[this.chatHistory.length - 1].role !== 'ai') {
            this.addMessage('ai', response);
          }
          this.isProcessing = false;
          this.updateStatus();
        }
      );
    } catch (error) {
      this.addMessage('ai', `Error: ${error instanceof Error ? error.message : String(error)}`);
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
      const prefix = message.role === 'user' ? '{green-fg}You:{/green-fg} ' : '{yellow-fg}AI:{/yellow-fg} ';
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
    // Create modal list
    const list = blessed.list({
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
        },
        border: {
          fg: 'white',
        },
      },
      label: ' Select a model ',
      scrollable: true,
      keys: true,
      vi: true,
    });

    // Try to refresh models
    try {
      this.availableModels = await getAvailableModels();
    } catch (error) {
      console.error('Failed to refresh models:', error);
    }

    // Add models to list
    const activeModel = getActiveModel();
    const items = this.availableModels.map(model => {
      let label = model.name;
      if (model.id === activeModel.id) {
        label = '{green-fg}' + label + ' (active){/green-fg}';
      }
      return label;
    });
    list.setItems(items);

    // Add list to screen
    this.screen.append(list);
    list.focus();

    // Handle selection
    list.on('select', async (_, index) => {
      const selectedModel = this.availableModels[index];
      if (selectedModel) {
        setActiveModel(selectedModel.id);
        this.updateStatus();
      }
      
      // Remove list and render screen
      list.detach();
      this.screen.render();
      this.inputBox.focus();
    });

    // Handle escape
    list.key(['escape', 'q'], () => {
      list.detach();
      this.screen.render();
      this.inputBox.focus();
    });

    this.screen.render();
  }
}
