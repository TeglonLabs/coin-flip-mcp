# Enhanced Coin Flip MCP Server

An MCP server that provides true random coin flips using multiple randomness sources. This server demonstrates the Model Context Protocol by providing tools for generating random outcomes with configurable sides and multiple randomness providers.

## Features

### Randomness Providers

#### 🌩️ Random.org (Default)
- **Source**: Atmospheric noise from Random.org API
- **Type**: True physical randomness
- **Availability**: Always available (internet connection required)
- **Best for**: General purpose randomness, maximum entropy

#### ⛓️ Aptos Blockchain
- **Source**: Cryptographically secure validator randomness
- **Type**: Blockchain-based cryptographic randomness
- **Availability**: Requires Aptos CLI and deployed contracts
- **Best for**: Verifiable, auditable randomness with transaction records
- **Features**:
  - On-chain verification
  - Transaction hash tracking
  - Gas cost transparency
  - Balanced ternary support

### Tools

#### `flip_coin` - Enhanced Multi-Provider Coin Flip
- **Sides**: Configurable number of sides (default: 3)
- **Providers**: Choose from `random.org`, `aptos`, or `auto`
- **Custom Names**: Optional side names for semantic interpretation
- **Special Cases**: Handles edge cases (0, 1, negative sides)
- **Output Formats**:
  - 2 sides: "heads" or "tails"
  - 3 sides: "-", "0", "+" (balanced ternary: thesis/synthesis/antithesis)
  - n>3 sides: "side X"
  - Custom names: Uses provided side names

#### `randomness_info` - Provider Status
- Lists all configured randomness providers
- Shows availability status
- Displays current active provider
- Useful for debugging and transparency

### Dialectical and Meta-Patterns

For 3-sided coins, try these creative interpretations:

**Temporal Analysis**
- past/present/future
- predecessor/current/successor

**Epistemic States**
- true/unknown/false
- certain/possible/impossible

**Dialectical Analysis**
- thesis/synthesis/antithesis
- negation/unity/affirmation

**Evaluation Frameworks**
- win/draw/lose
- less/same/more
- below/within/above

**Meta-Usage Patterns**
1. Use **less/same/more** to guide abstraction level of discourse
2. Use **past/present/future** to determine temporal focus
3. Chain multiple flips to create decision trees
4. Use **thesis/synthesis/antithesis** for dialectical reasoning

## Configuration

### Environment Variables

```bash
# Aptos Configuration
APTOS_CONTRACT_ADDRESS="0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69"
APTOS_NETWORK="testnet"  # testnet, mainnet, or devnet
APTOS_TERNARY_MODULE="ternary_coin_secure"
APTOS_BINARY_MODULE="coin_flip_working"

# Provider Controls
COIN_FLIP_DISABLE_RANDOM_ORG="false"  # Set to "true" to disable Random.org
```

### Aptos Setup

To use Aptos randomness, you need:

1. **Aptos CLI installed**:
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Aptos profile configured**:
   ```bash
   aptos init --profile testnet --network testnet
   ```

3. **Deployed contracts** (optional - defaults provided):
   - The server uses pre-deployed contracts on Aptos testnet
   - Contract address: `0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69`
   - Modules: `ternary_coin_secure`, `coin_flip_working`

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "coin-flip": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-coin-flip"],
      "env": {
        "APTOS_CONTRACT_ADDRESS": "0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69",
        "APTOS_NETWORK": "testnet"
      }
    }
  }
}
```

## Example Usage

Once connected to an MCP client like Claude Desktop:

### Basic Usage
- "Flip a coin" (uses auto provider selection)
- "Roll a 6-sided die"
- "Give me a random number between 1 and 20"

### Provider-Specific Usage
- "Flip a coin using Aptos blockchain randomness"
- "Use random.org to flip a 3-sided coin"
- "Get randomness info to see available providers"

### Semantic Interpretation
- "Flip a dialectical coin with thesis/synthesis/antithesis"
- "Give me a temporal decision: past/present/future"
- "Flip rock/paper/scissors for game logic"

### Advanced Usage
```
Flip a coin with:
- sides: 3
- sideNames: ["reduce_abstraction", "maintain_level", "increase_abstraction"]
- provider: "aptos"
```

## Randomness Quality

### Random.org
- **Entropy Source**: Atmospheric noise
- **Bias**: None (true randomness)
- **Verification**: Statistical tests by Random.org
- **Latency**: ~100-500ms
- **Cost**: Free (with rate limits)

### Aptos Blockchain
- **Entropy Source**: Validator consensus + cryptographic functions
- **Bias**: None (rejection sampling for perfect uniformity)
- **Verification**: On-chain, publicly auditable
- **Latency**: ~2-5 seconds (blockchain confirmation)
- **Cost**: Gas fees (~7 gas units ≈ 0.0007 APT)
- **Additional Benefits**:
  - Transaction hash for full audit trail
  - Impossible to manipulate or predict
  - Distributed trust model

## Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

For Aptos debugging:
```bash
# Check provider availability
aptos move view --function-id 0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69::ternary_coin_secure::get_ternary_stats --args address:0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69

# Test manual flip
aptos move run --function-id 0x7940aac91c7adf771d26611ed0cb0db99ad5b447c32974aae254cf48e3b2ad69::ternary_coin_secure::secure_ternary_flip --profile testnet --assume-yes
```

## Architecture

### Randomness Provider Interface

The server uses a modular architecture with a `RandomnessProvider` interface:

```typescript
interface RandomnessProvider {
  readonly name: string;
  readonly description: string;
  isAvailable(): Promise<boolean>;
  generateRandomInteger(min: number, max: number): Promise<RandomnessResult>;
  generateRandomIntegers(count: number, min: number, max: number): Promise<RandomnessResult[]>;
}
```

### Fallback System

The `RandomnessManager` provides automatic failover:
1. Attempts providers in configured order
2. Falls back to next available provider on failure
3. Provides detailed error reporting
4. Maintains provider health status

### Blockchain Integration

The Aptos provider interfaces with deployed Move contracts:
- **Binary randomness**: Uses `coin_flip_working::flip_coin`
- **Ternary randomness**: Uses `ternary_coin_secure::secure_ternary_flip`
- **Statistics tracking**: Monitors on-chain flip counts
- **Gas optimization**: Efficient rejection sampling

## Contributing

Contributions are welcome! Areas for enhancement:

1. **Additional Providers**: Implement providers for other blockchains or randomness sources
2. **Caching**: Add intelligent caching for blockchain providers
3. **Analytics**: Enhanced statistical analysis of randomness quality
4. **UI**: Web interface for direct testing
5. **Testing**: Comprehensive test suite for all providers

Please feel free to submit a Pull Request.

## Security Considerations

### Random.org
- ✅ Cryptographically secure
- ✅ Independently audited
- ⚠️ Requires trust in Random.org service
- ⚠️ Network-dependent

### Aptos Blockchain
- ✅ Cryptographically secure
- ✅ Trustless (distributed consensus)
- ✅ Publicly verifiable
- ✅ Resistant to manipulation
- ⚠️ Requires gas fees
- ⚠️ Slower than Random.org

## License

MIT