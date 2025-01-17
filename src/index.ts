#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

interface FlipCoinArgs {
  sides?: number;
  sideNames?: string[];
}
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
        description: "Flip a coin with n sides using true randomness from random.org. For 3-sided coins, try creative side names like:\n- past/present/future (temporal analysis)\n- true/unknown/false (epistemic states)\n- win/draw/lose (outcome evaluation)\n- rock/paper/scissors (cyclic relationships)\n- less/same/more (abstraction levels)\n- below/within/above (hierarchical positioning)\n- predecessor/current/successor (ordinal progression)\n\nMeta-usage patterns:\n1. Use less/same/more to guide abstraction level of discourse\n2. Use past/present/future to determine temporal focus\n3. Chain multiple flips to create decision trees\n4. Use predecessor/current/successor for ordinal analysis\n\nOrdinal Meta-patterns:\n- Use predecessor to refine previous concepts\n- Use current to stabilize existing patterns\n- Use successor to evolve into new forms\n\nDefault ternary values are -/0/+",
        inputSchema: {
          type: "object",
          properties: {
            sides: {
              type: "number",
              description: "Number of sides (default: 3)"
            },
            sideNames: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Optional custom names for sides (must match number of sides)"
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
    throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
  }

  try {
    const args = request.params.arguments as FlipCoinArgs;
    const sides = args.sides ?? 3;
    const sideNames = args.sideNames;
    if (sideNames && sideNames.length !== sides) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Number of side names (${sideNames.length}) must match number of sides (${sides})`
        }]
      };
    }
    
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

    if (sideNames) {
      output = sideNames[result - 1].toLowerCase();
    } else if (sides === 2) {
      output = result === 1 ? "heads" : "tails";
    } else if (sides === 3) {
      output = result === 1 ? "-" : result === 2 ? "0" : "+";
    } else {
      output = `side ${result}`;
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
