/**
 * Test Fixtures
 * This file contains test data fixtures that can be reused across tests.
 */

// Sample response data for Anthropic API
export const sampleAnthropicResponse = {
  id: 'msg_sample123',
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: 'This is a sample response from the Anthropic API.',
    },
  ],
  model: 'claude-3-opus-20240229',
  stop_reason: 'end_turn',
  usage: {
    input_tokens: 10,
    output_tokens: 20,
  },
};

// MCP Sample Messages
export const sampleMcpMessages = {
  request: {
    type: 'request',
    id: 'req_sample123',
    data: {
      command: 'execute',
      args: ['echo', 'Hello, World!'],
    },
  },
  response: {
    type: 'response',
    id: 'res_sample123',
    request_id: 'req_sample123',
    data: {
      stdout: 'Hello, World!',
      stderr: '',
      exit_code: 0,
    },
  },
  error: {
    type: 'error',
    id: 'err_sample123',
    request_id: 'req_sample123',
    error: {
      code: 'ERR_EXECUTION_FAILED',
      message: 'Command execution failed',
    },
  },
};

// Sample CLI commands
export const sampleCommands = {
  valid: 'echo "Hello, World!"',
  invalid: 'unknown-command',
  withArgs: 'echo "arg1" "arg2"',
};

// Sample file content for testing file operations
export const sampleFileContent = {
  text: 'This is a sample text file content for testing.',
  json: JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } }, null, 2),
};
