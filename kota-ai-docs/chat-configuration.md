# KOTA AI Chat Interface Configuration

The KOTA AI Chat Interface can be customized through a configuration file. This document outlines the available configuration options and how to use them.

## Configuration File Locations

The system looks for configuration files in the following locations, in order of priority:

1. `.kota-ai/chat.json` in the current working directory
2. `.kota-ai/chat.yaml` in the current working directory
3. `config/chat.json` in the current working directory
4. `config/chat.yaml` in the current working directory
5. `~/.kota-ai/chat.json` in the user's home directory
6. `~/.kota-ai/chat.yaml` in the user's home directory

Both JSON and YAML formats are supported. If no configuration file is found, default values will be used.

## Configuration Options

### Borders

Controls the appearance of borders around UI elements.

```yaml
borders:
  chatBox:
    type: "line"  # Options: line, bg, ascii, double
    color: "blue" # Any valid blessed color
  inputBox:
    type: "line"  # Options: line, bg, ascii, double
    color: "blue" # Any valid blessed color
```

### Colors

Sets colors for different message types and UI elements.

```yaml
colors:
  user:
    name: "white"  # Color for the user name/header
    text: "white"  # Color for the user messages
  assistant:
    name: "green"  # Color for the assistant name/header
    text: "white"  # Color for the assistant messages
  system:
    name: "yellow" # Color for system message headers
    text: "white"  # Color for system messages
  statusBar:
    foreground: "white" # Status bar text color
    background: "blue"  # Status bar background color
```

### Scrollbar

Customizes the appearance of the scrollbar in the chat box.

```yaml
scrollbar:
  track:
    character: " "            # Character used for scrollbar track
    backgroundColor: "gray"   # Background color of scrollbar track
  style:
    inverse: true             # Whether to use inverse video for scrollbar
```

### Text Formatting

Controls how messages are formatted and displayed.

```yaml
formatting:
  timestampFormat: "HH:mm:ss" # Time format for message timestamps
  userPrefix: "[You]"         # Prefix for user messages
  assistantPrefix: "[KOTA AI]" # Prefix for assistant messages
  systemPrefix: "[System]"    # Prefix for system messages
```

### UI Settings

General UI layout and appearance settings.

```yaml
ui:
  chatBoxHeight: "90%"        # Height of chat box (percentage or number of lines)
  inputBoxHeight: 3           # Height of input box (number of lines)
  title: "KOTA AI Chat Interface" # Window title
  statusBarText: "{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history" # Status bar text
```

## Available Colors

The following color names are supported by the blessed library:

- `black`
- `red`
- `green`
- `yellow`
- `blue`
- `magenta`
- `cyan`
- `white`
- `gray` (or `grey`)
- `brightRed`
- `brightGreen`
- `brightYellow`
- `brightBlue`
- `brightMagenta`
- `brightCyan`
- `brightWhite`

You can also use hex values like `#ff0000` for custom colors.

## Example Configuration

Here's a complete example configuration in YAML format:

```yaml
# Kota AI Chat Interface Configuration

# Border settings
borders:
  chatBox:
    type: "line"
    color: "blue"
  inputBox:
    type: "line"
    color: "blue"

# Colors for different message types
colors:
  user:
    name: "white"
    text: "white"
  assistant:
    name: "green"
    text: "white"
  system:
    name: "yellow"
    text: "white"
  statusBar:
    foreground: "white"
    background: "blue"

# Scrollbar settings
scrollbar:
  track:
    character: " "
    backgroundColor: "gray"
  style:
    inverse: true

# Text formatting
formatting:
  timestampFormat: "HH:mm:ss"
  userPrefix: "[You]"
  assistantPrefix: "[KOTA AI]"
  systemPrefix: "[System]"

# Other UI settings
ui:
  chatBoxHeight: "90%"
  inputBoxHeight: 3
  title: "KOTA AI Chat Interface"
  statusBarText: "{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history"
```

## Styling with Blessed Tags

The status bar text and message formatting supports [blessed tags](https://github.com/chjj/blessed#content--tags) for styling. For example, you can use:

- `{bold}text{/bold}` - Bold text
- `{underline}text{/underline}` - Underlined text
- `{red-fg}text{/red-fg}` - Red foreground
- `{blue-bg}text{/blue-bg}` - Blue background

These tags can be used in the configuration for the status bar text and will be applied to the displayed text.
