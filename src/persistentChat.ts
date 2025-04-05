import blessed from 'blessed';
import { execCommand } from './commands.js';
import { AnthropicService } from './anthropicService.js';
import { MCPManager } from './mcpManager.js';
import { loadChatConfig, ChatInterfaceConfig } from './config.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

// Set a reasonable timeout for terminal commands (in milliseconds)
const TERMINAL_COMMAND_TIMEOUT = 30000; // 30 seconds

// List of potentially dangerous commands or command segments that should be blocked
const DANGEROUS_COMMANDS = [
  'rm -rf', 'rm -r /', 'rm -f /', 'rm /', 
  'mkfs', 'dd if=', 'format',
  '> /etc/', '> /dev/', '> /var/', '> /boot/',
  ':(){:|:&};:', 'fork bomb', 
  'shutdown', 'reboot', 'halt', 'poweroff',
  'mv / /dev/null'
];

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
  private config: ChatInterfaceConfig;

  constructor() {
    // Load configuration
    this.config = loadChatConfig();

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
      height: this.config.layout.chatBoxHeight,
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: this.config.layout.scrollbarStyle.trackBg,
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
          fg: this.config.colors.border,
        },
      },
    });

    // Create the input box
    this.inputBox = blessed.textarea({
      bottom: 1,
      left: 0,
      width: '100%',
      height: this.config.layout.inputBoxHeight,
      inputOnFocus: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: this.config.colors.border,
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
      content: this.config.labels.statusBar,
      style: {
        fg: this.config.colors.statusBar.foreground,
        bg: this.config.colors.statusBar.background,
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
    this.addSystemMessage(
      'Terminal commands: /run terminal <command> or /run term <command> (use -a flag to include output in conversation context)'
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
      // Extract the command part
      const commandPart = input.substring(5).trim();
      
      // Check if it's a terminal command
      if (commandPart.startsWith('terminal ') || commandPart.startsWith('term ')) {
        // Extract the actual terminal command and any flags
        const terminalCommandPart = commandPart.startsWith('terminal ') 
          ? commandPart.substring(9).trim() 
          : commandPart.substring(5).trim();
        
        // Check if -a flag is present to include in conversation context
        const includeInContext = terminalCommandPart.includes(' -a') || terminalCommandPart.startsWith('-a ');
        // Remove the -a flag from the command if present
        const cleanCommand = terminalCommandPart
          .replace(/\s+-a(\s|$)/, ' ')
          .replace(/^-a\s+/, '')
          .trim();
        
        this.addSystemMessage(`Executing terminal command: ${cleanCommand}`);
        
        try {
          const result = await this.executeTerminalCommand(cleanCommand);
          const outputMessage = `Terminal output:\n${result || 'Command executed successfully with no output.'}`;
          
          this.addSystemMessage(outputMessage);
          
          // If -a flag was provided, add this to the AI's conversation context
          if (includeInContext && this.anthropicService) {
            const contextMessage = `I ran this terminal command: \`${cleanCommand}\`\n\nThe output was:\n\`\`\`\n${result}\n\`\`\``;
            this.addUserMessage(contextMessage);
          }
        } catch (error) {
          this.addSystemMessage(
            `Error executing terminal command: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else {
        // Handle regular KOTA command
        this.addSystemMessage(`Executing command: ${commandPart}`);

        try {
          const result = await this.executeCommand(commandPart.split(' '));
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

  // Execute a terminal command and return its output
  private async executeTerminalCommand(command: string): Promise<string> {
    // Check for potentially dangerous commands
    for (const dangerousCommand of DANGEROUS_COMMANDS) {
      if (command.toLowerCase().includes(dangerousCommand.toLowerCase())) {
        throw new Error(
          `Command rejected for security reasons. The command contains '${dangerousCommand}' which could be dangerous.`
        );
      }
    }

    try {
      // Execute the command with a timeout
      const { stdout, stderr } = await Promise.race([
        execPromise(command),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Command timed out after ${TERMINAL_COMMAND_TIMEOUT / 1000} seconds`));
          }, TERMINAL_COMMAND_TIMEOUT);
        }),
      ]);

      // Combine stdout and stderr
      let output = '';
      if (stdout) output += stdout;
      if (stderr) output += `\nSTDERR: ${stderr}`;
      
      return output.trim();
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error types with more user-friendly messages
        if (error.message.includes('command not found')) {
          throw new Error(`Command not found: ${command}. Please check that the command is installed and spelled correctly.`);
        } else if (error.message.includes('permission denied')) {
          throw new Error(`Permission denied for command: ${command}. Try using sudo or check file permissions.`);
        } else if (error.message.includes('timed out')) {
          throw new Error(`Command execution timed out: ${command}. The command took too long to complete.`);
        }
        
        // Pass through the actual error
        throw error;
      }
      throw new Error(`Unknown error executing terminal command: ${String(error)}`);
    }
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
          content += `{bold}{${this.config.colors.userMessage}-fg}[${this.config.labels.user}] ${timeString}{/${this.config.colors.userMessage}-fg}{/bold}\n${message.content}\n\n`;
          break;
        case 'assistant':
          content += `{bold}{${this.config.colors.assistantMessage}-fg}[${this.config.labels.assistant}] ${timeString}{/${this.config.colors.assistantMessage}-fg}{/bold}\n${message.content}\n\n`;
          break;
        case 'system':
          content += `{bold}{${this.config.colors.systemMessage}-fg}[${this.config.labels.system}] ${timeString}{/${this.config.colors.systemMessage}-fg}{/bold}\n${message.content}\n\n`;
          break;
      }
    }

    this.chatBox.setContent(content);
    this.chatBox.scrollTo(this.chatBox.getScrollHeight());
  }
}
