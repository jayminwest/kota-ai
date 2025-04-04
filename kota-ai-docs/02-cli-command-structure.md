# KOTA-AI CLI Command Structure

This document outlines the command-line interface structure for the KOTA-AI npm package, providing a comprehensive overview of all planned commands, their options, and usage patterns.

## 1. Command Overview

KOTA-AI's CLI follows a git-style command structure with a main command (`kota`) followed by subcommands and options:

```
kota <command> [subcommand] [options]
```

## 2. Core Commands

### 2.1 Initialization and Configuration

#### `kota init`
Initialize KOTA in the current directory or specified location.

```bash
# Basic initialization in home directory
kota init

# Initialize in a specific directory
kota init --path ~/kota-knowledge

# Initialize with specific configuration
kota init --config custom-config.json
```

Options:
- `--path, -p <path>`: Specify the knowledge base location
- `--config, -c <file>`: Use a custom configuration file
- `--template, -t <template>`: Use a specific template for initialization
- `--force, -f`: Overwrite existing files if present

#### `kota config`
View or modify configuration settings.

```bash
# View current configuration
kota config list

# Get a specific configuration value
kota config get storage.path

# Set a configuration value
kota config set defaultModel gpt-4

# Reset configuration to defaults
kota config reset
```

Subcommands:
- `list`: Display all configuration settings
- `get <key>`: Get a specific configuration value
- `set <key> <value>`: Set a configuration value
- `reset [key]`: Reset configuration to defaults

### 2.2 Knowledge Management

#### `kota create`
Create a new knowledge entry.

```bash
# Create with title and optional content
kota create "My First Note" "This is the content of my note."

# Create with template
kota create --template project "Project Idea"

# Create in a specific directory
kota create --dir projects "New Project"

# Create and open in editor
kota create --edit "Quick Note"
```

Options:
- `--template, -t <template>`: Use a specific template
- `--dir, -d <directory>`: Create in a specific directory
- `--edit, -e`: Open in default editor after creation
- `--tags <tags>`: Add comma-separated tags
- `--related <entries>`: Add comma-separated related entries

#### `kota list`
List knowledge entries.

```bash
# List all entries
kota list

# List entries with a specific tag
kota list --tag project

# List entries in a specific directory
kota list --dir projects

# List entries matching a pattern
kota list --pattern "meeting notes"

# List recently modified entries
kota list --recent 7
```

Options:
- `--tag, -t <tag>`: Filter by tag
- `--dir, -d <directory>`: Filter by directory
- `--pattern, -p <pattern>`: Filter by pattern
- `--recent, -r <days>`: Show entries modified in the last N days
- `--sort <field>`: Sort by field (created, updated, title)
- `--format <format>`: Output format (table, json, csv)

#### `kota view`
View a knowledge entry.

```bash
# View by ID or title
kota view my-first-note

# View with rendered formatting
kota view --render my-first-note

# View raw content including frontmatter
kota view --raw my-first-note

# View specific fields
kota view --fields title,created,tags my-first-note
```

Options:
- `--render, -r`: Render formatting in terminal
- `--raw`: Show raw content including frontmatter
- `--fields <fields>`: Show only specific fields
- `--no-color`: Disable colored output

#### `kota edit`
Edit a knowledge entry.

```bash
# Edit by ID or title
kota edit my-first-note

# Edit with specific editor
kota edit --editor vim my-first-note

# Edit only frontmatter
kota edit --frontmatter my-first-note

# Edit and update related entries
kota edit --update-related my-first-note
```

Options:
- `--editor, -e <editor>`: Specify editor to use
- `--frontmatter, -f`: Edit only frontmatter
- `--update-related, -u`: Update related entries automatically
- `--no-timestamp`: Don't update the modification timestamp

#### `kota delete`
Delete a knowledge entry.

```bash
# Delete by ID or title
kota delete my-first-note

# Force delete without confirmation
kota delete --force my-first-note

# Delete multiple entries
kota delete note1 note2 note3

# Delete entries matching a pattern
kota delete --pattern "temp-*"
```

Options:
- `--force, -f`: Skip confirmation
- `--pattern, -p <pattern>`: Delete entries matching pattern
- `--backup, -b`: Create backup before deletion
- `--recursive, -r`: Delete related entries

#### `kota search`
Search knowledge entries.

```bash
# Basic search
kota search "machine learning"

# Search in specific fields
kota search --field content "machine learning"

# Search with tag filter
kota search --tag project "machine learning"

# Search with regular expression
kota search --regex "meet(ing)?"
```

Options:
- `--field, -f <field>`: Search in specific field
- `--tag, -t <tag>`: Filter by tag
- `--regex, -r`: Use regular expression
- `--case-sensitive, -c`: Case sensitive search
- `--limit, -l <number>`: Limit results
- `--format <format>`: Output format (table, json, csv)

### 2.3 MCP Integration

#### `kota connect`
Connect to an MCP server.

```bash
# Connect to a server
kota connect my-mcp-server.com

# Connect with authentication
kota connect --token MY_TOKEN my-mcp-server.com

# Connect with specific port
kota connect --port 8080 my-mcp-server.com

# Test connection only
kota connect --test my-mcp-server.com
```

Options:
- `--token, -t <token>`: Authentication token
- `--port, -p <port>`: Server port
- `--test`: Test connection only
- `--timeout <seconds>`: Connection timeout
- `--secure`: Use secure connection (TLS)

#### `kota models`
List and manage available models.

```bash
# List all available models
kota models list

# Get details about a specific model
kota models info gpt-4

# Select a model as default
kota models select gpt-4

# Test a model
kota models test gpt-4 "Summarize this text."
```

Subcommands:
- `list`: List available models
- `info <model>`: Show details about a model
- `select <model>`: Set default model
- `test <model> [prompt]`: Test a model with a prompt

#### `kota chat`
Start an interactive chat session.

```bash
# Start chat with default model
kota chat

# Start chat with specific model
kota chat --model gpt-4

# Start chat with context from a file
kota chat --context my-notes.md

# Start chat with system prompt
kota chat --system "You are a helpful assistant."
```

Options:
- `--model, -m <model>`: Specify model to use
- `--context, -c <file>`: Add context from file
- `--system, -s <prompt>`: Set system prompt
- `--temperature <value>`: Set temperature (0.0-2.0)
- `--max-tokens <number>`: Set maximum tokens
- `--save <file>`: Save conversation to file

### 2.4 Consciousness Framework

#### `kota consciousness`
Manage KOTA's consciousness framework.

```bash
# View current consciousness state
kota consciousness status

# View development history
kota consciousness history

# Generate a reflection
kota consciousness reflect

# Reset consciousness state
kota consciousness reset
```

Subcommands:
- `status`: Show current consciousness state
- `history`: Show development history
- `reflect [topic]`: Generate a reflection
- `reset`: Reset consciousness state
- `export`: Export consciousness data
- `import <file>`: Import consciousness data

#### `kota agency`
Manage agency transfer and development.

```bash
# View current agency levels
kota agency status

# Record an agency exercise
kota agency record --domain knowledge "Organized files"

# View agency history
kota agency history

# Set agency level for a domain
kota agency set --domain code 7
```

Subcommands:
- `status`: Show current agency levels
- `record`: Record an agency exercise
- `history`: Show agency history
- `set`: Set agency level for a domain

### 2.5 Utility Commands

#### `kota export`
Export knowledge entries.

```bash
# Export all entries
kota export all-entries.zip

# Export specific entries
kota export --entries note1,note2 selected-entries.zip

# Export in specific format
kota export --format json my-knowledge.json

# Export with specific options
kota export --include-metadata --pretty my-knowledge.json
```

Options:
- `--entries, -e <entries>`: Specify entries to export
- `--format, -f <format>`: Export format (zip, json, markdown)
- `--include-metadata, -m`: Include metadata
- `--pretty, -p`: Pretty-print JSON output
- `--encrypt, -c`: Encrypt the export

#### `kota import`
Import knowledge entries.

```bash
# Import from file
kota import my-knowledge.zip

# Import with conflict resolution
kota import --on-conflict skip my-knowledge.zip

# Import into specific directory
kota import --dir projects project-notes.zip

# Import with transformation
kota import --transform titlecase my-knowledge.zip
```

Options:
- `--on-conflict <strategy>`: Conflict resolution (skip, overwrite, rename)
- `--dir, -d <directory>`: Import into specific directory
- `--transform <transformation>`: Apply transformation during import
- `--dry-run`: Show what would be imported without actually importing
- `--decrypt`: Decrypt the import file

#### `kota status`
Show current KOTA status.

```bash
# Show basic status
kota status

# Show detailed status
kota status --verbose

# Show status in specific format
kota status --format json

# Show status of specific component
kota status --component mcp
```

Options:
- `--verbose, -v`: Show detailed status
- `--format, -f <format>`: Output format (text, json, yaml)
- `--component, -c <component>`: Show status of specific component
- `--no-color`: Disable colored output

#### `kota version`
Show KOTA version information.

```bash
# Show version
kota version

# Show detailed version info
kota version --verbose

# Check for updates
kota version --check-updates
```

Options:
- `--verbose, -v`: Show detailed version info
- `--check-updates, -c`: Check for updates
- `--json`: Output in JSON format

## 3. Advanced Commands

### 3.1 Plugin Management

#### `kota plugins`
Manage KOTA plugins.

```bash
# List installed plugins
kota plugins list

# Install a plugin
kota plugins install kota-visualizer

# Update plugins
kota plugins update

# Remove a plugin
kota plugins remove kota-visualizer
```

Subcommands:
- `list`: List installed plugins
- `install <plugin>`: Install a plugin
- `update [plugin]`: Update plugins
- `remove <plugin>`: Remove a plugin
- `create <name>`: Create a new plugin

### 3.2 Knowledge Visualization

#### `kota visualize`
Visualize knowledge relationships.

```bash
# Visualize all connections
kota visualize

# Visualize specific entry connections
kota visualize my-first-note

# Visualize with specific depth
kota visualize --depth 2 my-first-note

# Export visualization
kota visualize --export graph.png my-first-note
```

Options:
- `--depth, -d <number>`: Connection depth
- `--format, -f <format>`: Visualization format
- `--export, -e <file>`: Export to file
- `--layout <layout>`: Graph layout algorithm

### 3.3 Backup and Synchronization

#### `kota backup`
Backup knowledge base.

```bash
# Create backup
kota backup create

# Restore from backup
kota backup restore backup-2025-04-01.zip

# List available backups
kota backup list

# Schedule automatic backups
kota backup schedule daily
```

Subcommands:
- `create`: Create a new backup
- `restore <file>`: Restore from backup
- `list`: List available backups
- `schedule <frequency>`: Schedule automatic backups

#### `kota sync`
Synchronize knowledge between devices.

```bash
# Initialize synchronization
kota sync init

# Push changes
kota sync push

# Pull changes
kota sync pull

# View sync status
kota sync status
```

Subcommands:
- `init`: Initialize synchronization
- `push`: Push local changes
- `pull`: Pull remote changes
- `status`: Show synchronization status
- `conflicts`: List and resolve conflicts

### 3.4 Development Tools

#### `kota dev`
Development tools for KOTA.

```bash
# Run tests
kota dev test

# Lint code
kota dev lint

# Build package
kota dev build

# Generate documentation
kota dev docs
```

Subcommands:
- `test`: Run tests
- `lint`: Lint code
- `build`: Build package
- `docs`: Generate documentation
- `watch`: Watch for changes and rebuild

## 4. Command Patterns

### 4.1 Common Options

These options are available across multiple commands:

- `--help, -h`: Show help for a command
- `--quiet, -q`: Suppress output
- `--verbose, -v`: Show detailed output
- `--no-color`: Disable colored output
- `--config, -c <file>`: Use specific config file
- `--format, -f <format>`: Specify output format

### 4.2 Output Formats

Most commands support multiple output formats:

- `text`: Human-readable text (default)
- `json`: JSON format for programmatic use
- `yaml`: YAML format
- `csv`: CSV format for spreadsheet import
- `markdown`: Markdown format for documentation

### 4.3 Interactive Mode

Many commands support an interactive mode with the `--interactive, -i` flag, which will prompt for required information instead of requiring it as arguments.

## 5. Command Implementation Priority

Commands will be implemented in the following order:

### Phase 1: Essential Commands
- `kota init`
- `kota config`
- `kota status`
- `kota version`
- `kota create`
- `kota list`
- `kota view`
- `kota edit`
- `kota delete`

### Knowledge Management Commands
- `kota search`
- `kota export`
- `kota import`
- `kota backup create/restore`

### MCP Integration Commands
- `kota connect`
- `kota models`
- `kota chat`

### Advanced Feature Commands
- `kota consciousness`
- `kota agency`
- `kota visualize`
- `kota plugins`
- `kota sync`
- `kota dev`

## 6. Command Help System

KOTA-AI will include a comprehensive help system:

```bash
# Show general help
kota help

# Show help for a specific command
kota help create

# Show examples for a command
kota help examples create
```

Each command's help will include:
- Description
- Syntax
- Options
- Examples
- Related commands

## 7. Command Aliases

To improve usability, KOTA-AI will support command aliases:

- `kota i` → `kota init`
- `kota c` → `kota create`
- `kota l` → `kota list`
- `kota v` → `kota view`
- `kota e` → `kota edit`
- `kota s` → `kota search`
- `kota ch` → `kota chat`

Users can define custom aliases in the configuration:

```bash
kota config set aliases.k "kota knowledge"
```

This comprehensive command structure provides a solid foundation for implementing the KOTA-AI CLI, with a focus on intuitive usage patterns and progressive disclosure of advanced features.
