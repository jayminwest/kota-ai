import blessed from 'blessed';
import { EventEmitter } from 'node:events';
import { ChatbotInterface, ChatMessage } from './chatbotInterface.js';
import { Logger } from '../utils/logger.js';

export interface TerminalInterfaceOptions {
  chatbot: ChatbotInterface;
  logger?: Logger;
  title?: string;
}

/**
 * Terminal-based interface for the chatbot built with blessed
 */
export class TerminalInterface extends EventEmitter {
  private chatbot: ChatbotInterface;
  private logger: Logger;
  private screen!: blessed.Widgets.Screen;
  private chatBox!: blessed.Widgets.BoxElement;
  private inputBox!: blessed.Widgets.TextareaElement;
  private statusBar!: blessed.Widgets.BoxElement;
  private inputHistory: string[] = [];
  private inputHistoryIndex: number = -1;
  private title: string;

  /**
   * Create a new terminal interface for the chatbot
   * @param options Configuration options
   */
  constructor(options: TerminalInterfaceOptions) {
    super();
    this.chatbot = options.chatbot;
    this.logger = options.logger || new Logger();
    this.title = options.title || 'KOTA AI Chat Interface';

    // Initialize the UI
    this.setupUI();
    this.setupEventHandlers();
    
    // Display welcome message
    this.addSystemMessage(
      'Welcome to KOTA AI! Type a message to chat with an AI or use /run followed by a command to execute commands.'
    );
  }

  /**
   * Setup the blessed UI components
   */
  private setupUI(): void {
    // Initialize the blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: this.title,
    });

    // Create the chat message display box
    this.chatBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '90%',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'gray',
        },
        style: {
          inverse: true,
        },
      },
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'blue',
        },
      },
    });

    // Create the input box
    this.inputBox = blessed.textarea({
      bottom: 1,
      left: 0,
      width: '100%',
      height: 3,
      inputOnFocus: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'blue',
        },
      },
    });

    // Create the status bar
    this.statusBar = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      content:
        '{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history',
      style: {
        fg: 'white',
        bg: 'blue',
      },
    });

    // Add the components to the screen
    this.screen.append(this.chatBox);
    this.screen.append(this.inputBox);
    this.screen.append(this.statusBar);
  }

  /**
   * Setup event handlers for UI interactions
   */
  private setupEventHandlers(): void {
    // Handle key events
    this.inputBox.key(['enter'], () => this.handleInput());
    this.inputBox.key(['up'], () => this.navigateInputHistory('up'));
    this.inputBox.key(['down'], () => this.navigateInputHistory('down'));

    // Add Ctrl+C handler to inputBox to ensure it works when input has focus
    this.inputBox.key(['C-c'], () => this.cleanupAndExit());

    // Exit on Escape, Control-C, or q
    this.screen.key(['escape', 'C-c', 'q'], () => this.cleanupAndExit());

    // Listen for chatbot events
    this.chatbot.on('error', (error) => {
      this.addSystemMessage(`Error: ${error}`);
    });
  }

  /**
   * Start the terminal interface
   */
  public start(): void {
    // Focus the input box by default
    this.inputBox.focus();
    this.screen.render();
  }

  /**
   * Handle user input
   */
  private handleInput(): void {
    const input = this.inputBox.getValue().trim();

    if (input === '') return;

    // Add to input history
    this.inputHistory.unshift(input);
    if (this.inputHistory.length > 50) {
      this.inputHistory.pop();
    }
    this.inputHistoryIndex = -1;

    // Clear the input box
    this.inputBox.setValue('');

    // Add user message to chat
    this.addUserMessage(input);

    // Process the input
    this.processInput(input);

    // Render the screen
    this.screen.render();
  }

  /**
   * Process the user input
   */
  private async processInput(input: string): Promise<void> {
    if (input.startsWith('/run ')) {
      // Handle command
      const command = input.substring(5).trim();
      this.addSystemMessage(`Executing command: ${command}`);

      try {
        const result = await this.chatbot.executeCommand(command);
        this.addSystemMessage(
          `Command output:\n${result || 'Command executed successfully.'}`
        );
      } catch (error) {
        this.addSystemMessage(
          `Error executing command: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (input.startsWith('/clear')) {
      // Clear the chat history
      this.chatbot.clearConversation();
      this.clearChatBox();
      this.addSystemMessage('Conversation cleared.');
    } else if (input.startsWith('/help')) {
      // Show help
      this.addSystemMessage(
        'Available commands:\n' +
        '/run <command> - Execute a command\n' +
        '/clear - Clear conversation history\n' +
        '/help - Show this help message'
      );
    } else {
      // Handle chat message
      this.addAssistantMessage('Thinking...');

      try {
        await this.chatbot.sendMessage(
          input,
          (chunk) => {
            this.updateLastAssistantMessage((existing) => existing + chunk);
            this.screen.render();
          }
        );
      } catch (error) {
        this.addSystemMessage(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.screen.render();
  }

  /**
   * Navigate through input history
   */
  private navigateInputHistory(direction: 'up' | 'down'): void {
    if (this.inputHistory.length === 0) return;

    if (direction === 'up') {
      this.inputHistoryIndex = Math.min(
        this.inputHistoryIndex + 1,
        this.inputHistory.length - 1
      );
    } else {
      this.inputHistoryIndex = Math.max(this.inputHistoryIndex - 1, -1);
    }

    if (this.inputHistoryIndex === -1) {
      this.inputBox.setValue('');
    } else {
      this.inputBox.setValue(this.inputHistory[this.inputHistoryIndex]);
    }

    this.screen.render();
  }

  /**
   * Add a user message to the chat
   */
  private addUserMessage(content: string): void {
    const message: ChatMessage = {
      content,
      role: 'user',
      timestamp: new Date(),
    };

    this.updateChatBox();
  }

  /**
   * Add an assistant message to the chat
   */
  private addAssistantMessage(content: string): void {
    const message: ChatMessage = {
      content,
      role: 'assistant',
      timestamp: new Date(),
    };

    this.updateChatBox();
  }

  /**
   * Update the last assistant message
   */
  private updateLastAssistantMessage(
    contentUpdater: string | ((existing: string) => string)
  ): void {
    // Get the current conversation
    const conversation = this.chatbot.getConversation();
    
    // Find the last assistant message
    for (let i = conversation.length - 1; i >= 0; i--) {
      if (conversation[i].role === 'assistant') {
        // This is just to update the UI - the actual content is already
        // being updated in the chatbot through the streaming callback
        this.updateChatBox();
        break;
      }
    }
  }

  /**
   * Add a system message to the chat
   */
  private addSystemMessage(content: string): void {
    const message: ChatMessage = {
      content,
      role: 'system',
      timestamp: new Date(),
    };

    this.updateChatBox();
  }

  /**
   * Clear the chat box
   */
  private clearChatBox(): void {
    this.chatBox.setContent('');
    this.screen.render();
  }

  /**
   * Update the chat box with the current conversation
   */
  private updateChatBox(): void {
    const conversation = this.chatbot.getConversation();
    
    // Clear the content first
    this.chatBox.setContent('');

    // Build the content and add it with setContent
    let content = '';
    for (const message of conversation) {
      const timeString = message.timestamp.toLocaleTimeString();

      switch (message.role) {
        case 'user':
          content += `{bold}[You] ${timeString}{/bold}\n${message.content}\n\n`;
          break;
        case 'assistant':
          content += `{bold}{green-fg}[KOTA AI] ${timeString}{/green-fg}{/bold}\n${message.content}\n\n`;
          break;
        case 'system':
          content += `{bold}{yellow-fg}[System] ${timeString}{/yellow-fg}{/bold}\n${message.content}\n\n`;
          break;
      }
    }

    this.chatBox.setContent(content);
    this.chatBox.scrollTo(this.chatBox.getScrollHeight());
  }

  /**
   * Clean up resources and exit
   */
  private cleanupAndExit(): void {
    this.emit('exit');
    process.exit(0);
  }
}
