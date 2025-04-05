# Issue: Make Persistent Chat Interface Configurable

**Date:** 2025-04-05

**Reporter:** AI Assistant

**Status:** Open

## Description

The current persistent chat interface (`src/persistentChat.ts`) uses hardcoded values for colors, styles, and potentially layout elements (like border types, scrollbar characters, etc.). This makes it difficult for users to customize the appearance of the chat interface to their preferences or terminal themes.

## Proposed Solution

1.  **Introduce a Configuration File:** Create a configuration file (e.g., `config/chat.yaml` or `.kota-ai/chat.json`) to store styling and appearance settings for the chat interface.
2.  **Load Configuration:** Modify `src/persistentChat.ts` to load these settings at startup.
3.  **Apply Configuration:** Update the `blessed` widget creation logic to use the loaded configuration values instead of hardcoded ones. This includes:
    *   Colors (foreground, background) for different elements (chat box, input box, status bar, borders, scrollbar).
    *   Styles (bold, underline, etc.) for text elements (user messages, AI messages, system messages, status bar text).
    *   Characters used for borders, scrollbars, etc.
    *   Potentially layout options if deemed necessary.
4.  **Default Configuration:** Provide sensible default values if the configuration file is missing or incomplete.
5.  **Documentation:** Document the configuration file format and available options.

## Acceptance Criteria

*   Users can change the colors and styles of the chat interface elements by modifying a configuration file.
*   The application loads and applies these settings correctly.
*   The application falls back to reasonable defaults if the configuration is missing or invalid.
*   The configuration options are documented.

## Potential Challenges

*   Choosing a suitable configuration file format (YAML, JSON, TOML) and location.
*   Parsing and validating the configuration file.
*   Mapping configuration options cleanly to `blessed` properties.
