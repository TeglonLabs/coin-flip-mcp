# Coin Flip MCP Server

An MCP server that provides true random coin flips using random.org's randomness API. This server demonstrates the Model Context Protocol by providing a tool for generating random outcomes with configurable sides.

<a href="https://glama.ai/mcp/servers/f57ohq0c54"><img width="380" height="200" src="https://glama.ai/mcp/servers/f57ohq0c54/badge" alt="Coin Flip Server MCP server" /></a>

## Features

### Tools
- `flip_coin` - Flip a coin with configurable number of sides
  - Optional `sides` parameter (default: 2)
  - Uses true randomness from random.org
  - Special handling for edge cases (0, 1, or negative sides)
  - For 2 sides: Returns "Heads" or "Tails"
  - For 3 sides: Returns "Heads", "Tails", or "_"
  - For n>3 sides: Returns "It landed on side X"

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
      "args": ["-y", "@modelcontextprotocol/server-coin-flip"]
    }
  }
}
```

## Example Usage

Once connected to an MCP client like Claude Desktop, you can use natural language to interact with the coin flip tool. For example:

- "Flip a coin"
- "Roll a 6-sided die"
- "Give me a random number between 1 and 20"

The server will use true randomness from random.org to generate the result.

## Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
