# Chat Interface Configuration

KOTA AI's persistent chat interface can be customized using configuration files. This document describes how to customize the appearance and behavior of the chat interface.

## Configuration File Locations

KOTA AI will look for configuration files in the following locations, in order:

1. `~/.kota/chat-config.yaml`
2. `~/.kota/chat-config.yml`
3. `~/.kota/chat-config.json`
4. `./chat-config.yaml` (in the current working directory)
5. `./chat-config.yml` (in the current working directory)
6. `./chat-config.json` (in the current working directory)

The first configuration file found will be used. If no configuration file is found, default values will be used.

## Configuration Format

The configuration can be specified in either YAML or JSON format. Below is an example of each format:

### YAML Format

```yaml
colors:
  border: blue
  userMessage: white
  assistantMessage: green
  systemMessage: yellow
  statusBar:
    foreground: white
    background: blue
layout:
  chatBoxHeight: '90%'
  inputBoxHeight: 3
  scrollbarStyle:
    trackBg: gray
labels:
  user: You
  assistant: KOTA AI
  system: System
  statusBar: "{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history"
```

### JSON Format

```json
{
  "colors": {
    "border": "blue",
    "userMessage": "white",
    "assistantMessage": "green",
    "systemMessage": "yellow",
    "statusBar": {
      "foreground": "white",
      "background": "blue"
    }
  },
  "layout": {
    "chatBoxHeight": "90%",
    "inputBoxHeight": 3,
    "scrollbarStyle": {
      "trackBg": "gray"
    }
  },
  "labels": {
    "user": "You",
    "assistant": "KOTA AI",
    "system": "System",
    "statusBar": "{bold}KOTA AI{/bold} | Press Ctrl+C to exit | Enter to send | Up/Down for history"
  }
}
```

## Configuration Options

### Colors

The `colors` section configures the colors of various UI elements:

| Option | Description | Default |
|--------|-------------|---------|
| `border` | Color of the border around chat box and input box | `blue` |
| `userMessage` | Color for user message headers | `white` |
| `assistantMessage` | Color for assistant message headers | `green` |
| `systemMessage` | Color for system message headers | `yellow` |
| `statusBar.foreground` | Text color for the status bar | `white` |
| `statusBar.background` | Background color for the status bar | `blue` |

Available colors depend on the terminal's capabilities but typically include: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, and potentially brighter variants.

### Layout

The `layout` section configures the dimensions and appearance of UI elements:

| Option | Description | Default |
|--------|-------------|---------|
| `chatBoxHeight` | Height of the chat display area | `90%` |
| `inputBoxHeight` | Height of the input area in lines | `3` |
| `scrollbarStyle.trackBg` | Background color of the scrollbar track | `gray` |

### Labels

The `labels` section configures the text shown in various parts of the interface:

| Option | Description | Default |
|--------|-------------|---------|
| `user` | Label for user messages | `You` |
| `assistant` | Label for assistant messages | `KOTA AI` |
| `system` | Label for system messages | `System` |
| `statusBar` | Content of the status bar | `{bold}KOTA AI{/bold} \| Press Ctrl+C to exit \| Enter to send \| Up/Down for history` |

## Creating a Configuration File

You can create a configuration file manually, or you can run the following command to generate a default configuration file:

```bash
# Create a default configuration in YAML format
kota config create --format yaml

# Create a default configuration in JSON format
kota config create --format json
```

The configuration file will be created in the `~/.kota/` directory.

## Blessed Tag Syntax

The status bar content and other labeled elements support Blessed's tag syntax to apply styling:

- `{bold}text{/bold}`: Bold text
- `{italic}text{/italic}`: Italic text
- `{underline}text{/underline}`: Underlined text
- `{blink}text{/blink}`: Blinking text
- `{color-fg}text{/color-fg}`: Colored text (replace "color" with an actual color name)
- `{color-bg}text{/color-bg}`: Colored background (replace "color" with an actual color name)

For example, to make text bold and red:
```
{bold}{red-fg}This is bold red text{/red-fg}{/bold}
```

## Examples

### Cyberpunk Theme

```yaml
colors:
  border: magenta
  userMessage: cyan
  assistantMessage: green
  systemMessage: yellow
  statusBar:
    foreground: black
    background: magenta
layout:
  chatBoxHeight: '90%'
  inputBoxHeight: 3
  scrollbarStyle:
    trackBg: blue
labels:
  user: HUMAN
  assistant: NEURAL-AI
  system: SYSTEM
  statusBar: "{bold}{black-fg}:: NEURAL-AI INTERFACE ::{/black-fg}{/bold} | TERMINATE: CTRL+C | TRANSMIT: ENTER"
```

### Minimal Theme

```yaml
colors:
  border: white
  userMessage: white
  assistantMessage: white
  systemMessage: white
  statusBar:
    foreground: black
    background: white
layout:
  chatBoxHeight: '95%'
  inputBoxHeight: 2
  scrollbarStyle:
    trackBg: gray
labels:
  user: Me
  assistant: AI
  system: *
  statusBar: "KOTA | Ctrl+C: Exit | Enter: Send"
```
