/**
 * Configuration for the coin flip MCP server
 */

export interface AptosConfig {
  contractAddress?: string;
  network?: "testnet" | "mainnet" | "devnet";
  moduleNames?: {
    ternary?: string;
    binary?: string;
  };
}

export interface ServerConfig {
  aptos?: AptosConfig;
  enableRandomOrg?: boolean;
}

/**
 * Load configuration from environment variables or default values
 */
export function loadConfig(): ServerConfig {
  return {
    enableRandomOrg: process.env.COIN_FLIP_DISABLE_RANDOM_ORG !== "true",
    aptos: {
      contractAddress: process.env.APTOS_CONTRACT_ADDRESS || "0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69",
      network: (process.env.APTOS_NETWORK as "testnet" | "mainnet" | "devnet") || "testnet",
      moduleNames: {
        ternary: process.env.APTOS_TERNARY_MODULE || "ternary_coin_secure",
        binary: process.env.APTOS_BINARY_MODULE || "coin_flip_working"
      }
    }
  };
}