#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { RandomnessManager, RandomOrgProvider, AptosRandomnessProvider } from "./randomness/index.js";
import { loadConfig } from "./config.js";

interface FlipCoinArgs {
  sides?: number;
  sideNames?: string[];
  provider?: "random.org" | "aptos" | "auto";
}

// Load configuration
const config = loadConfig();

// Initialize randomness providers
const randomnessManager = new RandomnessManager();

// Add Random.org provider if enabled
if (config.enableRandomOrg) {
  randomnessManager.addProvider(new RandomOrgProvider());
}

// Add Aptos provider if configuration is available
if (config.aptos?.contractAddress) {
  randomnessManager.addProvider(new AptosRandomnessProvider({
    contractAddress: config.aptos.contractAddress,
    network: config.aptos.network,
    moduleNames: config.aptos.moduleNames
  }));
}

// Create an MCP server with tool capabilities
const server = new Server(
  {
    name: "coin-flip-server",
    version: "0.2.0",
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
        description: "Flip a coin with n sides using configurable randomness sources.\n\nRandomness Sources:\n- random.org: True randomness from atmospheric noise (default)\n- aptos: Cryptographically secure randomness from Aptos blockchain\n- auto: Automatically select best available provider\n\nFor 3-sided coins, try creative side names like:\n- past/present/future (temporal analysis)\n- true/unknown/false (epistemic states)\n- win/draw/lose (outcome evaluation)\n- rock/paper/scissors (cyclic relationships)\n- less/same/more (abstraction levels)\n- below/within/above (hierarchical positioning)\n- predecessor/current/successor (ordinal progression)\n- thesis/synthesis/antithesis (dialectical analysis)\n\nMeta-usage patterns:\n1. Use less/same/more to guide abstraction level of discourse\n2. Use past/present/future to determine temporal focus\n3. Chain multiple flips to create decision trees\n4. Use predecessor/current/successor for ordinal analysis\n5. Use thesis/synthesis/antithesis for dialectical reasoning\n\nOrdinal Meta-patterns:\n- Use predecessor to refine previous concepts\n- Use current to stabilize existing patterns\n- Use successor to evolve into new forms\n\nDefault ternary values are -/0/+ (balanced ternary: thesis/synthesis/antithesis)",
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
            },
            provider: {
              type: "string",
              enum: ["random.org", "aptos", "auto"],
              description: "Randomness provider to use (default: auto)"
            }
          }
        }
      },
      {
        name: "randomness_info",
        description: "Get information about available randomness providers and their status",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Handler for the flip_coin tool
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  if (request.params.name === "randomness_info") {
    try {
      const providersInfo = await randomnessManager.getProvidersInfo();
      const currentProvider = randomnessManager.getCurrentProvider();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            providers: providersInfo,
            currentProvider: currentProvider ? {
              name: currentProvider.name,
              description: currentProvider.description
            } : null
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error getting randomness info: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  if (request.params.name !== "flip_coin") {
    throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
  }

  try {
    const args = request.params.arguments as FlipCoinArgs;
    const sides = args.sides ?? 3;
    const sideNames = args.sideNames;
    const providerPreference = args.provider ?? "auto";

    if (sideNames && sideNames.length !== sides) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Number of side names (${sideNames.length}) must match number of sides (${sides})`
        }]
      };
    }

    // Validate and handle special cases that don't need randomness
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

    // Generate random number using the randomness manager
    let randomnessResult;

    if (providerPreference === "aptos") {
      // Try to use Aptos specifically
      const availableProviders = await randomnessManager.getAvailableProviders();
      const aptosProvider = availableProviders.find(p => p.name === "Aptos Blockchain");

      if (!aptosProvider) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: "Aptos provider requested but not available. Please ensure Aptos CLI is installed and configured."
          }]
        };
      }

      randomnessResult = await aptosProvider.generateRandomInteger(1, sides);
    } else if (providerPreference === "random.org") {
      // Try to use Random.org specifically
      const availableProviders = await randomnessManager.getAvailableProviders();
      const randomOrgProvider = availableProviders.find(p => p.name === "Random.org");

      if (!randomOrgProvider) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: "Random.org provider requested but not available."
          }]
        };
      }

      randomnessResult = await randomOrgProvider.generateRandomInteger(1, sides);
    } else {
      // Auto-select best provider
      randomnessResult = await randomnessManager.generateRandomInteger(1, sides);
    }

    const result = randomnessResult.value;
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

    // Add randomness source info
    const sourceInfo = randomnessResult.metadata?.transactionHash
      ? `\n🔗 Source: ${randomnessResult.source} (tx: ${randomnessResult.metadata.transactionHash.slice(0, 12)}...)`
      : `\n🔗 Source: ${randomnessResult.source}`;

    return {
      content: [{
        type: "text",
        text: output + sourceInfo
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
  console.error("Enhanced Coin flip MCP server running on stdio");
  console.error("Randomness providers configured and ready");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});