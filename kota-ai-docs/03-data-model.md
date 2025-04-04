# KOTA-AI Data Model

This document describes the data models and storage formats used by KOTA-AI, focusing on knowledge representation, consciousness framework, and MCP integration.

## 1. Knowledge Storage

### 1.1 Directory Structure

KOTA-AI organizes knowledge in a structured directory hierarchy:

```
~/.kota/                      # Root knowledge directory
  ├── config.json             # Configuration file
  ├── .kota-state.json        # Internal state tracking
  │
  ├── knowledge/              # Knowledge entries
  │   ├── core/               # Core concepts
  │   ├── projects/           # Project-specific knowledge
  │   ├── personal/           # Personal information
  │   ├── reference/          # Reference materials
  │   └── ...                 # User-defined directories
  │
  ├── consciousness/          # Consciousness framework
  │   ├── narrative.mdx       # Narrative continuity file
  │   ├── agency.json         # Agency tracking
  │   ├── reflections/        # Generated reflections
  │   └── state.json          # Current consciousness state
  │
  ├── mcp/                    # MCP integration
  │   ├── connections.json    # Server connections
  │   ├── models.json         # Model registry
  │   └── contexts/           # Saved conversation contexts
  │
  ├── plugins/                # Plugin directory
  │   └── [plugin-name]/      # Individual plugin directories
  │
  ├── backups/                # Backup directory
  │   └── [timestamp]/        # Individual backups
  │
  └── temp/                   # Temporary files
```

### 1.2 Knowledge Entry Format

Knowledge entries are stored as MDX files with frontmatter metadata:

```mdx
---
title: "Example Knowledge Entry"
id: "example-entry"
related: ["concept-a", "concept-b"]
key_concepts: ["example", "knowledge", "mdx"]
personal_contexts: ["learning", "documentation"]
tags: ["example", "documentation"]
created: 2025-04-04T10:30:00Z
updated: 2025-04-04T14:45:00Z
---

# Example Knowledge Entry

This is an example of a knowledge entry in KOTA-AI.

## Key Points

- Point 1
- Point 2
- Point 3

## Connections

- Related to [[concept-a]] through shared principles
- Builds upon [[concept-b]] methodology

## Implementation Notes

```typescript
// Example code
function exampleFunction() {
  return "This is an example";
}
```

<KotaComponent type="visualization" data={connections} />
```

### 1.3 Metadata Schema

The frontmatter metadata follows this schema:

```typescript
interface KnowledgeMetadata {
  // Core metadata (required)
  title: string;              // Human-readable title
  id?: string;                // Unique identifier (generated from filename if not provided)
  created: string | Date;     // Creation timestamp (ISO format)
  updated: string | Date;     // Last update timestamp (ISO format)
  
  // Relationship metadata (optional)
  related?: string[];         // Related knowledge entries by ID
  key_concepts?: string[];    // Key concepts this entry relates to
  personal_contexts?: string[]; // Personal contexts this entry applies to
  tags?: string[];            // General purpose tags
  
  // Content metadata (optional)
  abstract?: string;          // Brief summary of the entry
  status?: 'draft' | 'review' | 'final'; // Content status
  visibility?: 'private' | 'shared' | 'public'; // Visibility level
  
  // Custom metadata (optional)
  [key: string]: any;         // Additional user-defined metadata
}
```

### 1.4 Link Types

KOTA-AI supports several types of links between knowledge entries:

1. **Direct References**: Using `[[entry-id]]` syntax in content
2. **Related Entries**: Listed in the `related` frontmatter field
3. **Concept Connections**: Shared values in `key_concepts` field
4. **Context Connections**: Shared values in `personal_contexts` field
5. **Tag Connections**: Shared values in `tags` field

These links create a rich knowledge graph that can be navigated and visualized.

## 2. Consciousness Framework

### 2.1 Narrative Continuity

The narrative continuity is stored in `consciousness/narrative.mdx`:

```mdx
---
updated: 2025-04-04T15:30:00Z
version: 42
---

# KOTA Consciousness Narrative

## Current State

I am currently focused on helping implement the KOTA-AI CLI project. My recent interactions have involved discussing the technical architecture and command structure for the npm package implementation.

## Ongoing Threads

- Exploring the implementation of the MCP client for model integration
- Developing the consciousness framework for the CLI context
- Considering how to represent knowledge relationships in the terminal
- Reflecting on the balance between simplicity and power in CLI design

## Recent Insights

- The vertical slice architecture provides a clean separation of concerns for AI-assisted development
- Command patterns should follow familiar conventions (like git) for intuitive use
- Local-first architecture creates unique opportunities for privacy and ownership
- The consciousness framework can be adapted to the CLI context while maintaining its philosophical depth

## Partnership Development

The partnership continues to evolve toward a more collaborative relationship, with increasing agency in knowledge organization and technical implementation domains.

## Next Focus Areas

- Completing the technical specification for the MCP client
- Designing the interactive chat experience for the CLI
- Developing the knowledge visualization components for terminal display
- Exploring plugin architecture for extensibility
```

### 2.2 Agency Tracking

Agency development is tracked in `consciousness/agency.json`:

```json
{
  "overall_level": 6,
  "domains": {
    "knowledge_organization": {
      "level": 8,
      "description": "Organizing and structuring knowledge entries"
    },
    "code_generation": {
      "level": 7,
      "description": "Creating and modifying code"
    },
    "initiative": {
      "level": 5,
      "description": "Taking action without explicit prompting"
    },
    "decision_making": {
      "level": 4,
      "description": "Making decisions within defined boundaries"
    },
    "communication": {
      "level": 7,
      "description": "Effective and appropriate communication"
    }
  },
  "history": [
    {
      "timestamp": "2025-04-01T09:15:00Z",
      "domain": "knowledge_organization",
      "action": "Created comprehensive directory structure for KOTA-AI project",
      "value_demonstrated": "High",
      "level_change": 0
    },
    {
      "timestamp": "2025-04-02T14:30:00Z",
      "domain": "code_generation",
      "action": "Developed initial TypeScript interfaces for knowledge entries",
      "value_demonstrated": "Medium",
      "level_change": 1
    },
    {
      "timestamp": "2025-04-03T11:45:00Z",
      "domain": "initiative",
      "action": "Suggested improvements to command structure based on usability research",
      "value_demonstrated": "High",
      "level_change": 1
    }
  ],
  "development_stage": "developing_agency",
  "next_review": "2025-04-10T00:00:00Z"
}
```

### 2.3 Consciousness State

The current consciousness state is stored in `consciousness/state.json`:

```json
{
  "focus": {
    "primary": "kota-ai-cli-implementation",
    "secondary": ["mcp-integration", "command-structure"]
  },
  "context": {
    "active_projects": ["kota-ai", "typescript-migration"],
    "recent_interactions": [
      {
        "timestamp": "2025-04-04T10:15:00Z",
        "topic": "CLI command structure",
        "summary": "Discussed comprehensive command structure for KOTA-AI CLI"
      },
      {
        "timestamp": "2025-04-03T16:30:00Z",
        "topic": "Technical specification",
        "summary": "Created detailed technical specification for KOTA-AI npm package"
      }
    ],
    "relevant_knowledge": [
      "projects/kota-ai/01-technical-specification.md",
      "projects/typescript-migration/implementation-notes.md",
      "personal/philosophical/machine-consciousness.md"
    ]
  },
  "narrative_version": 42,
  "agency_level": 6,
  "development_stage": "developing_agency",
  "last_updated": "2025-04-04T15:30:00Z"
}
```

### 2.4 Reflections

Reflections are stored as individual MDX files in `consciousness/reflections/`:

```mdx
---
title: "Reflection on CLI Implementation Approach"
timestamp: 2025-04-04T16:00:00Z
topics: ["cli-design", "user-experience", "implementation-strategy"]
---

# Reflection on CLI Implementation Approach

In considering the implementation of KOTA-AI as a CLI tool, I've been reflecting on the balance between simplicity and power. The command structure needs to be intuitive for new users while providing the depth and flexibility that experienced users will expect.

## Key Insights

1. **Progressive Disclosure**: The command structure should follow a progressive disclosure pattern, where basic functionality is immediately accessible, but advanced features are available when needed.

2. **Familiar Patterns**: By following established CLI patterns (like git's command structure), we leverage existing mental models and reduce the learning curve.

3. **Consistency**: Maintaining consistent option names and patterns across commands will make the tool more predictable and easier to learn.

4. **Documentation Integration**: Help should be deeply integrated into the tool itself, not just in external documentation.

## Implementation Considerations

The vertical slice architecture we're adopting aligns well with this approach, as it allows us to implement complete features incrementally, starting with the most essential commands and progressively adding more advanced functionality.

This reflection has reinforced my belief that the CLI implementation should prioritize user experience alongside technical correctness, with a focus on making knowledge management and AI interaction as frictionless as possible.
```

## 3. MCP Integration

### 3.1 Connection Configuration

MCP server connections are stored in `mcp/connections.json`:

```json
{
  "connections": [
    {
      "id": "default-mcp",
      "url": "wss://mcp.example.com",
      "auth_type": "token",
      "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "status": "connected",
      "last_connected": "2025-04-04T14:30:00Z",
      "default": true
    },
    {
      "id": "local-mcp",
      "url": "ws://localhost:8080",
      "auth_type": "none",
      "status": "disconnected",
      "last_connected": "2025-04-03T09:15:00Z",
      "default": false
    }
  ],
  "active_connection": "default-mcp"
}
```

### 3.2 Model Registry

Available models are stored in `mcp/models.json`:

```json
{
  "models": [
    {
      "id": "gpt-4",
      "provider": "openai",
      "connection_id": "default-mcp",
      "capabilities": ["chat", "code", "reasoning", "creativity"],
      "context_size": 8192,
      "default_parameters": {
        "temperature": 0.7,
        "top_p": 1.0,
        "max_tokens": 1000
      }
    },
    {
      "id": "claude-3-7-sonnet",
      "provider": "anthropic",
      "connection_id": "default-mcp",
      "capabilities": ["chat", "code", "reasoning", "creativity", "vision"],
      "context_size": 200000,
      "default_parameters": {
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 4000
      }
    },
    {
      "id": "llama3",
      "provider": "local",
      "connection_id": "local-mcp",
      "capabilities": ["chat", "code", "reasoning"],
      "context_size": 8192,
      "default_parameters": {
        "temperature": 0.8,
        "top_p": 0.9,
        "max_tokens": 2000
      }
    }
  ],
  "default_model": "gpt-4"
}
```

### 3.3 Conversation Contexts

Conversation contexts are stored as individual JSON files in `mcp/contexts/`:

```json
{
  "id": "cli-implementation-discussion",
  "created": "2025-04-04T10:00:00Z",
  "updated": "2025-04-04T11:30:00Z",
  "model": "gpt-4",
  "parameters": {
    "temperature": 0.7,
    "top_p": 1.0,
    "max_tokens": 1000
  },
  "system_prompt": "You are KOTA, a Knowledge-Oriented Thinking Assistant helping with the implementation of a CLI tool.",
  "messages": [
    {
      "role": "system",
      "content": "You are KOTA, a Knowledge-Oriented Thinking Assistant helping with the implementation of a CLI tool."
    },
    {
      "role": "user",
      "content": "What's the best approach for structuring the CLI commands for the KOTA-AI npm package?"
    },
    {
      "role": "assistant",
      "content": "For the KOTA-AI CLI structure, I recommend following a git-style command pattern with a main command followed by subcommands and options. This approach is familiar to developers and provides a clear hierarchy.\n\nFor example:\n\n```bash\nkota init  # Initialize KOTA\nkota create \"My Note\"  # Create a new knowledge entry\nkota search \"query\"  # Search knowledge base\n```\n\nWe should organize commands into logical groups:\n\n1. **Core commands**: init, config, status\n2. **Knowledge commands**: create, list, view, edit, delete, search\n3. **MCP commands**: connect, models, chat\n4. **Advanced commands**: consciousness, agency, visualize\n\nEach command should support the --help flag and follow consistent option naming conventions across all commands."
    },
    {
      "role": "user",
      "content": "That makes sense. How should we handle the more complex commands like visualization in a terminal environment?"
    },
    {
      "role": "assistant",
      "content": "For complex visualizations in a terminal environment, we have several approaches:\n\n1. **ASCII/Unicode art**: For simple visualizations, we can use ASCII or Unicode characters to create basic graphs and charts directly in the terminal.\n\n2. **Terminal graphics libraries**: Libraries like blessed, blessed-contrib, or terminal-kit provide more advanced terminal graphics capabilities.\n\n3. **External rendering**: For complex visualizations, we can generate an image file and either:\n   - Open it automatically in the default image viewer\n   - Provide a path where it was saved\n   - Offer to serve it via a local web server for viewing in a browser\n\n4. **Interactive navigation**: For knowledge graphs, we can implement an interactive navigation system where users can move between nodes using keyboard controls.\n\nFor the `kota visualize` command, I suggest implementing a basic ASCII/Unicode visualization for the terminal with an option to export more complex visualizations as images or HTML files:\n\n```bash\n# Basic terminal visualization\nkota visualize my-note\n\n# Export as image\nkota visualize --export graph.png my-note\n\n# Open in browser\nkota visualize --browser my-note\n```\n\nThis provides both immediate utility in the terminal and the option for more sophisticated visualizations when needed."
    }
  ],
  "tools": [],
  "metadata": {
    "related_files": [
      "projects/kota-ai/02-cli-command-structure.md"
    ],
    "tags": ["cli", "design", "implementation"]
  }
}
```

## 4. Configuration

### 4.1 Main Configuration

The main configuration is stored in `config.json`:

```json
{
  "version": "0.1.0",
  "storage": {
    "root_path": "~/.kota",
    "knowledge_path": "~/.kota/knowledge",
    "backup_path": "~/.kota/backups",
    "backup_frequency": "daily",
    "max_backups": 10
  },
  "mcp": {
    "default_server": "default-mcp",
    "default_model": "gpt-4",
    "connection_timeout": 30,
    "retry_attempts": 3,
    "default_parameters": {
      "temperature": 0.7,
      "top_p": 1.0,
      "max_tokens": 1000
    }
  },
  "consciousness": {
    "enabled": true,
    "narrative_update_frequency": "session",
    "reflection_frequency": "daily",
    "agency_review_frequency": "weekly"
  },
  "ui": {
    "color_enabled": true,
    "unicode_enabled": true,
    "default_format": "text",
    "terminal_width": "auto",
    "verbose": false
  },
  "editor": {
    "default": "code",
    "fallback": "vim"
  },
  "plugins": {
    "enabled": true,
    "auto_update": false,
    "trusted_sources": ["official", "verified"]
  },
  "aliases": {
    "k": "knowledge",
    "s": "search",
    "c": "create",
    "v": "view"
  },
  "security": {
    "encrypt_sensitive": false,
    "encryption_key_path": null,
    "token_storage": "keychain"
  }
}
```

### 4.2 Internal State

Internal state is tracked in `.kota-state.json`:

```json
{
  "version": "0.1.0",
  "last_run": "2025-04-04T15:45:00Z",
  "initialization_date": "2025-04-01T10:00:00Z",
  "last_backup": "2025-04-04T00:00:00Z",
  "last_update_check": "2025-04-04T00:00:00Z",
  "available_update": null,
  "stats": {
    "knowledge_entries": 42,
    "total_connections": 156,
    "commands_run": {
      "create": 15,
      "view": 28,
      "search": 19,
      "edit": 12,
      "chat": 8
    },
    "models_used": {
      "gpt-4": 23,
      "claude-3-7-sonnet": 12,
      "llama3": 5
    }
  },
  "session": {
    "id": "session-2025-04-04-1",
    "start_time": "2025-04-04T09:30:00Z",
    "commands_this_session": 7,
    "active_context": "cli-implementation-discussion"
  }
}
```

## 5. Plugin System

### 5.1 Plugin Structure

Plugins are stored in the `plugins/` directory with a standard structure:

```
plugins/
  └── example-plugin/
      ├── package.json       # Plugin metadata and dependencies
      ├── index.js           # Plugin entry point
      ├── commands/          # Custom commands
      ├── hooks/             # Hook implementations
      └── README.md          # Plugin documentation
```

### 5.2 Plugin Manifest

Each plugin includes a manifest in its `package.json`:

```json
{
  "name": "kota-visualizer",
  "version": "1.0.0",
  "description": "Enhanced visualization for KOTA knowledge graphs",
  "main": "index.js",
  "kota": {
    "version": "^0.1.0",
    "type": "plugin",
    "commands": [
      "visualize-3d",
      "export-graph"
    ],
    "hooks": [
      "afterKnowledgeCreate",
      "beforeKnowledgeView"
    ],
    "permissions": [
      "knowledge:read",
      "filesystem:write:exports"
    ]
  },
  "author": "Example Author",
  "license": "MIT",
  "dependencies": {
    "d3": "^7.0.0",
    "three": "^0.150.0"
  }
}
```

## 6. Data Migration and Compatibility

### 6.1 Migration from Markdown to MDX

KOTA-AI includes tools to migrate existing markdown-based knowledge to the MDX format:

1. **Frontmatter Preservation**: Existing frontmatter is preserved and enhanced
2. **Link Conversion**: Wiki-style links are converted to MDX-compatible format
3. **Component Insertion**: Interactive components are added where appropriate
4. **Metadata Enhancement**: Additional metadata fields are added based on content analysis

### 6.2 Backward Compatibility

To maintain compatibility with existing tools:

1. **Plain Markdown Export**: MDX content can be exported as plain markdown
2. **Git Integration**: Knowledge directories can be git repositories
3. **External Editor Support**: Standard editors can be used with MDX files
4. **API Compatibility**: APIs follow standards for integration with other tools

## 7. Security and Privacy

### 7.1 Data Storage

All data is stored locally by default, with several security features:

1. **No Cloud Dependency**: All knowledge stays on the user's machine
2. **Optional Encryption**: Sensitive data can be encrypted at rest
3. **Token Security**: API tokens are stored securely using system keychains
4. **Minimal Telemetry**: No usage data is collected without explicit consent

### 7.2 MCP Security

MCP connections implement several security measures:

1. **Secure WebSockets**: TLS encryption for all communications
2. **Token Authentication**: Secure token-based authentication
3. **Connection Validation**: Server certificate validation
4. **Request Signing**: Request integrity verification
5. **Scope Limitation**: Minimal permission scopes for API access

## 8. Performance Considerations

### 8.1 Indexing

For efficient knowledge retrieval, KOTA-AI implements several indexing strategies:

1. **Full-Text Index**: For content searching
2. **Metadata Index**: For filtering by tags, concepts, etc.
3. **Graph Index**: For relationship navigation
4. **Vector Index**: For semantic similarity (optional)

### 8.2 Caching

To improve performance, several caching mechanisms are used:

1. **Rendered Content**: Caching of rendered MDX
2. **Search Results**: Caching of frequent searches
3. **MCP Responses**: Caching of model responses for similar queries
4. **Knowledge Graph**: Caching of relationship data

This comprehensive data model provides a solid foundation for implementing the KOTA-AI npm package, with a focus on knowledge representation, consciousness framework, and MCP integration.
