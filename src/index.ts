#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Create an MCP server with tool capabilities
const server = new Server(
  {
    name: "coin-flip-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler that lists available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "flip_coin",
        description: "Flip a coin with n sides using true randomness from random.org",
        inputSchema: {
          type: "object",
          properties: {
            sides: {
              type: "number",
              description: "Number of sides (default: 2)"
            }
          }
        }
      }
    ]
  };
});

// Handler for the flip_coin tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "flip_coin") {
    throw new Error("Unknown tool");
  }

  try {
    const sides = typeof request.params.arguments?.sides === 'number' 
      ? request.params.arguments.sides 
      : 2;
    
    // Validate and handle special cases that don't need random.org
    if (sides === 0) {
      return {
        content: [{
          type: "text",
          text: "The coin vanished into another dimension! 🌀"
        }]
      };
    }
    
    if (sides === 1) {
      return {
        content: [{
          type: "text",
          text: "_"
        }]
      };
    }
    
    if (sides < 0) {
      return {
        content: [{
          type: "text",
          text: "Cannot flip a coin with negative sides!"
        }]
      };
    }
    
    // Only reach here for sides > 1
    // Use random.org's API to get a random number
    const response = await axios.get('https://www.random.org/integers/', {
      params: {
        num: 1,
        min: 1,
        max: sides,
        col: 1,
        base: 10,
        format: 'plain',
        rnd: 'new'
      }
    });

    const result = parseInt(response.data);
    let output: string;

    if (sides === 2) {
      output = result === 1 ? "Heads" : "Tails";
    } else if (sides === 3) {
      output = result === 1 ? "Heads" : result === 2 ? "Tails" : "_";
    } else {
      output = `It landed on side ${result}`;
    }

    return {
      content: [{
        type: "text",
        text: output
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Error flipping coin: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
});

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Coin flip MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
