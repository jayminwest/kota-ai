import fs from 'node:fs';
import { MCPClient } from './client.js';
import { MCPServerConfig, MCPTransportType } from '../types/mcp.js';

const mcpClient = new MCPClient();

/**
 * Import MCP server configurations from a JSON file
 * @param args Command arguments, first argument is the file path, optional --force flag to overwrite without prompting
 */
export async function importMCPServers(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.log('Usage: kota mcp import <file-path> [--force]');
    return;
  }

  const filePath = args[0];
  const forceOverwrite = args.includes('--force');
  
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      return;
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let importData: { servers: any[] };
    
    try {
      importData = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error: Invalid JSON file: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    
    // Validate the overall structure
    if (!importData.servers || !Array.isArray(importData.servers)) {
      console.error('Error: Invalid import file format. Expected a JSON object with a "servers" array.');
      return;
    }
    
    if (importData.servers.length === 0) {
      console.error('Error: No server configurations found in the import file.');
      return;
    }
    
    // Process each server configuration
    let serversAdded = 0;
    let serversSkipped = 0;
    let serversOverwritten = 0;
    
    for (const serverConfig of importData.servers) {
      // Check if server with the same name already exists
      const existingServer = mcpClient.getServerByName(serverConfig.name);
      if (existingServer) {
        if (forceOverwrite) {
          // Overwrite without prompting
          mcpClient.addServer(serverConfig);
          serversOverwritten++;
          console.log(`Overwritten existing server: "${serverConfig.name}"`);
        } else {
          // Skip for now (no prompt in minimal version)
          console.log(`Skipped existing server: "${serverConfig.name}"`);
          serversSkipped++;
        }
      } else {
        // Add new server
        mcpClient.addServer(serverConfig);
        serversAdded++;
        console.log(`Added new server: "${serverConfig.name}"`);
      }
    }
    
    // Summary
    console.log('\nImport summary:');
    console.log(`- ${importData.servers.length} server configurations processed`);
    console.log(`- ${serversAdded} new servers added`);
    console.log(`- ${serversOverwritten} existing servers overwritten`);
    console.log(`- ${serversSkipped} servers skipped`);
    
  } catch (error) {
    console.error(`Error importing MCP servers: ${error instanceof Error ? error.message : String(error)}`);
  }
}
