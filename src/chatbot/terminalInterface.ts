import blessed from 'blessed';
import { AIProvider } from '../types/ai.js';
import { ChatMessage } from '../types/ai.js';

/**
 * Terminal-based chat interface using the blessed library
 */
export class TerminalInterface {
  private screen: blessed.Widgets.Screen;
  private chatBox: blessed.Widgets.BoxElement;
  private inputBox: blessed.Widgets.TextareaElement;
  private statusBar: blessed.Widgets.BoxElement;
  private aiProvider: AIProvider;
  private messages: ChatMessage[] = [];
  private isProcessing: boolean = false;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;

    // Initialize the screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'AI Chat Terminal',
    });

    // Create chat display box
    this.chatBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '80%',
      scrollable: true,
      alwaysScroll: true,
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'blue',
        },
      },
    });

    // Create input box
    this.inputBox = blessed.textarea({
      bottom: 1,
      left: 0,
      width: '100%',
      height: '20%',
      inputOnFocus: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'green',
        },
      },
    });

    // Create status bar
    this.statusBar = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      content: '{bold}AI Chat{/bold} | Press Ctrl+C to exit | Enter to send',
      style: {
        fg: 'white',
        bg: 'blue',
      },
    });

    // Add elements to screen
    this.screen.append(this.chatBox);
    this.screen.append(this.inputBox);
    this.screen.append(this.statusBar);

    // Set key handlers
    this.inputBox.key(['enter'], () => this.handleInput());
    this.screen.key(['escape', 'C-c'], () => process.exit(0));

    // Focus input box
    this.inputBox.focus();

    // Render the screen
    this.screen.render();

    // Display welcome message
    this.addSystemMessage('Welcome to AI Chat. Type a message to begin.');
  }

  private async handleInput(): Promise<void> {
    if (this.isProcessing) return;

    const text = this.inputBox.getValue().trim();
    if (!text) return;

    // Clear input
    this.inputBox.setValue('');
    this.screen.render();

    // Add user message to chat
    this.addMessage('user', text);

    // Process AI response
    this.isProcessing = true;
    this.addMessage('assistant', 'Thinking...');

    try {
      // Include all previous messages in the conversation
      const response = await this.aiProvider.chat(this.messages);

      // Replace "Thinking..." with actual response
      this.messages.pop();
      this.addMessage('assistant', response);
    } catch (error) {
      // Replace "Thinking..." with error message
      this.messages.pop();
      this.addSystemMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private addMessage(
    role: 'user' | 'assistant' | 'system',
    content: string
  ): void {
    // Add message to memory
    this.messages.push({ role, content });

    // Display in chat box
    let formattedMessage = '';

    switch (role) {
      case 'user':
        formattedMessage = `{green-fg}You:{/green-fg} ${content}\n\n`;
        break;
      case 'assistant':
        formattedMessage = `{blue-fg}AI:{/blue-fg} ${content}\n\n`;
        break;
      case 'system':
        formattedMessage = `{red-fg}System:{/red-fg} ${content}\n\n`;
        break;
    }

    this.chatBox.pushLine(formattedMessage);
    this.chatBox.setScrollPerc(100);
    this.screen.render();
  }

  // Add a system message (visible to the user but marked as system)
  public addSystemMessage(content: string): void {
    this.addMessage('system', content);
  }

  // Start the chat interface
  public start(): void {
    this.screen.render();
  }
}
