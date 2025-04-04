import blessed from 'blessed';
import { execCommand } from './commands.js';
import { AnthropicService } from './anthropicService.js';
import { MCPManager } from './mcpManager.js';

interface ChatMessage {
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export class PersistentChatInterface {
  private screen: blessed.Widgets.Screen;
  private chatBox: blessed.Widgets.BoxElement;
  private inputBox: blessed.Widgets.TextareaElement;
  private statusBar: blessed.Widgets.BoxElement;
  private messageHistory: ChatMessage[] = [];
  private inputHistory: string[] = [];
  private inputHistoryIndex: number = -1;
  private anthropicService: AnthropicService | null = null;
  private mcpManager: MCPManager = MCPManager.getInstance();

  constructor() {
    // Initialize the blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'KOTA AI Chat Interface',
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

    // Handle key events
    this.inputBox.key(['enter'], () => this.handleInput());
    this.inputBox.key(['up'], () => this.navigateInputHistory('up'));
    this.inputBox.key(['down'], () => this.navigateInputHistory('down'));

    // Add Ctrl+C handler to inputBox to ensure it works when input has focus
    this.inputBox.key(['C-c'], () => this.cleanupAndExit());

    // Exit on Escape, Control-C, or q
    this.screen.key(['escape', 'C-c', 'q'], () => this.cleanupAndExit());

    // Focus the input box by default
    this.inputBox.focus();

    // Initialize Anthropic service if API key is available
    try {
      this.anthropicService = AnthropicService.getInstance();
    } catch (error) {
      this.addSystemMessage(
        `Error initializing Anthropic service: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      this.addSystemMessage(
        'Please set the ANTHROPIC_API_KEY environment variable to use AI chat functionality.'
      );
    }

    // Display welcome message
    this.addSystemMessage(
      'Welcome to KOTA AI! Type a message to chat with Claude or use /run followed by a command to execute KOTA commands.'
    );
    this.addSystemMessage(
      'MCP commands: /run mcp connect <path>, /run mcp disconnect, /run mcp status'
    );
  }

  // Clean up resources and exit
  private cleanupAndExit(): void {
    // Ensure MCP server is disconnected
    this.mcpManager.disconnect();
    process.exit(0);
  }

  // Start the chat interface
  public start(): void {
    this.screen.render();
  }

  // Handle user input
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

  // Process the user input
  private async processInput(input: string): Promise<void> {
    if (input.startsWith('/run ')) {
      // Handle command
      const command = input.substring(5).trim();
      this.addSystemMessage(`Executing command: ${command}`);

      try {
        const result = await this.executeCommand(command.split(' '));
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
    } else {
      // Handle chat message
      if (!this.anthropicService) {
        this.addSystemMessage(
          'Anthropic service is not initialized. Please set the ANTHROPIC_API_KEY environment variable.'
        );
        return;
      }

      this.addAssistantMessage('Thinking...');

      try {
        await this.anthropicService.chatWithAI(
          input,
          (chunk) => {
            this.updateLastAssistantMessage((existing) => existing + chunk);
            this.screen.render();
          },
          () => {
            // When streaming is complete, do nothing special
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

  // Execute a command and capture its output
  private async executeCommand(args: string[]): Promise<string> {
    // Capture console output
    let output = '';
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (...args: any[]) => {
      output += args.join(' ') + '\n';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
    };

    try {
      // Execute the command
      await execCommand(args);
      return output.trim();
    } finally {
      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    }
  }

  // Navigate through input history
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

  // Add a user message to the chat
  private addUserMessage(content: string): void {
    const message: ChatMessage = {
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    this.messageHistory.push(message);
    this.updateChatBox();
  }

  // Add an assistant message to the chat
  private addAssistantMessage(content: string): void {
    const message: ChatMessage = {
      content,
      sender: 'assistant',
      timestamp: new Date(),
    };

    this.messageHistory.push(message);
    this.updateChatBox();
  }

  // Update the last assistant message (used for updating "thinking" states and streaming)
  private updateLastAssistantMessage(
    contentUpdater: string | ((existing: string) => string)
  ): void {
    // Find the last assistant message
    for (let i = this.messageHistory.length - 1; i >= 0; i--) {
      if (this.messageHistory[i].sender === 'assistant') {
        if (typeof contentUpdater === 'string') {
          this.messageHistory[i].content = contentUpdater;
        } else {
          this.messageHistory[i].content = contentUpdater(
            this.messageHistory[i].content
          );
        }
        this.updateChatBox();
        break;
      }
    }
  }

  // Add a system message to the chat
  private addSystemMessage(content: string): void {
    const message: ChatMessage = {
      content,
      sender: 'system',
      timestamp: new Date(),
    };

    this.messageHistory.push(message);
    this.updateChatBox();
  }

  // Update the chat box with all messages
  private updateChatBox(): void {
    // Clear the content first
    this.chatBox.setContent('');

    // Build the content and add it with setContent
    let content = '';
    for (const message of this.messageHistory) {
      const timeString = message.timestamp.toLocaleTimeString();

      switch (message.sender) {
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
}
