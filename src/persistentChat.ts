import blessed from 'blessed';
import { execCommand } from './commands.js';

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

    // Exit on Escape, Control-C, or q
    this.screen.key(['escape', 'C-c', 'q'], () => {
      return process.exit(0);
    });

    // Focus the input box by default
    this.inputBox.focus();

    // Display welcome message
    this.addSystemMessage(
      'Welcome to KOTA AI! Type a message to chat or use /run followed by a command to execute KOTA commands.'
    );
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
          `Error executing command: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } else {
      // Handle chat message
      this.addAssistantMessage('Processing your request...');

      try {
        // Here we would integrate with the actual AI model
        // For now, just send a placeholder response
        setTimeout(() => {
          this.updateLastAssistantMessage(
            'This is a placeholder response from KOTA AI. In the full implementation, this would be a response from the AI model.'
          );
          this.screen.render();
        }, 1000);
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

    console.log = (...args: any[]) => {
      output += args.join(' ') + '\n';
    };

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

  // Update the last assistant message (used for updating "thinking" states)
  private updateLastAssistantMessage(content: string): void {
    // Find the last assistant message
    for (let i = this.messageHistory.length - 1; i >= 0; i--) {
      if (this.messageHistory[i].sender === 'assistant') {
        this.messageHistory[i].content = content;
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
    let content = '';

    for (const message of this.messageHistory) {
      const timeString = message.timestamp.toLocaleTimeString();

      if (message.sender === 'user') {
        content += `{bold}[You] ${timeString}{/bold}\n${message.content}\n\n`;
      } else if (message.sender === 'assistant') {
        content += `{bold}{green}[KOTA AI] ${timeString}{/green}{/bold}\n${message.content}\n\n`;
      } else {
        content += `{bold}{yellow}[System] ${timeString}{/yellow}{/bold}\n${message.content}\n\n`;
      }
    }

    this.chatBox.setContent(content);
    this.chatBox.scrollTo(this.chatBox.getScrollHeight());
  }
}
