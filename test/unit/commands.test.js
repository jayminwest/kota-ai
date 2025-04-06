var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Unit tests for the commands module
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execCommand } from '../../src/commands.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
// Mock dependencies
vi.mock('node:fs');
vi.mock('node:path');
vi.mock('node:os');
vi.mock('../../src/anthropicService.js', () => {
    return {
        AnthropicService: {
            getInstance: () => ({
                chatWithAI: vi.fn((message, onChunk, onComplete) => __awaiter(void 0, void 0, void 0, function* () {
                    onChunk === null || onChunk === void 0 ? void 0 : onChunk('Mock AI response');
                    onComplete === null || onComplete === void 0 ? void 0 : onComplete();
                    return 'Mock AI response';
                })),
            }),
        },
    };
});
vi.mock('../../src/mcpManager.js', () => {
    return {
        MCPManager: {
            getInstance: () => ({
                connect: vi.fn().mockResolvedValue('Connected to MCP server'),
                disconnect: vi.fn().mockReturnValue('Disconnected from MCP server'),
                isConnectedToServer: vi.fn().mockReturnValue(false),
            }),
        },
    };
});
vi.mock('../../src/mcp/commands.js');
describe('commands', () => {
    // Spy on console methods
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    beforeEach(() => {
        // Mock implementation of required functions
        vi.mocked(os.homedir).mockReturnValue('/mock/home');
        vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
        vi.mocked(fs.existsSync).mockReturnValue(false);
        vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should show help when no command is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield execCommand([]);
        expect(consoleLogSpy).toHaveBeenCalledWith('Usage: kota <command>');
    }));
    it('should initialize KOTA directories', () => __awaiter(void 0, void 0, void 0, function* () {
        yield execCommand(['init']);
        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('KOTA initialized successfully.');
    }));
    it('should handle chat command', () => __awaiter(void 0, void 0, void 0, function* () {
        yield execCommand(['chat', 'Hello', 'AI']);
        expect(consoleLogSpy).toHaveBeenCalledWith('AI: Thinking...');
        expect(consoleLogSpy).toHaveBeenCalledWith('AI: Mock AI response');
    }));
    it('should show error when chat command has no message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield execCommand(['chat']);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Please provide a message to chat with the AI.');
    }));
    it('should show error for unknown command', () => __awaiter(void 0, void 0, void 0, function* () {
        yield execCommand(['unknown-command']);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: unknown-command');
    }));
    describe('MCP Commands', () => {
        it('should handle mcp connect command', () => __awaiter(void 0, void 0, void 0, function* () {
            yield execCommand(['mcp', 'connect', '/path/to/mcp']);
            // We can't easily test this directly since the function is mocked
            // Instead, verify the console output
            expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MCP server');
        }));
        it('should handle mcp disconnect command', () => __awaiter(void 0, void 0, void 0, function* () {
            yield execCommand(['mcp', 'disconnect']);
            expect(consoleLogSpy).toHaveBeenCalledWith('Disconnected from MCP server');
        }));
        it('should handle mcp status command', () => __awaiter(void 0, void 0, void 0, function* () {
            yield execCommand(['mcp', 'status']);
            expect(consoleLogSpy).toHaveBeenCalledWith('MCP Status: Not connected');
        }));
    });
});
