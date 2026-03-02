# OpenGov MCP Server (Claude Desktop + Codex Desktop Guide)

An MCP (Model Context Protocol) server that lets Claude Desktop and Codex Desktop query Socrata Open Data portals.

This fork is documented for **manual installation from source** on both **macOS** and **Windows**, with defaults tuned for:

- `https://data.cambridgema.gov`

## What This Server Does

It exposes one MCP tool, `get_data`, for:

- Discovering datasets (`catalog`, `categories`, `tags`)
- Reading metadata (`dataset-metadata`, `column-info`)
- Querying records with SoQL (`data-access`)
- Reading portal metrics (`site-metrics`)

## Default Data Portal

If `DATA_PORTAL_URL` is not set, this fork defaults to:

- `https://data.cambridgema.gov`

You can still override per-server with:

- `DATA_PORTAL_URL=https://your-portal.example`

## Required Libraries and Tools

### System Requirements

- Git (for cloning)
- Node.js `18+` (Node.js `20+` recommended)
- npm (bundled with Node.js)

### Runtime npm Dependencies

- `@modelcontextprotocol/sdk`
- `axios`
- `dotenv`

### Development npm Dependencies (for local build/test/lint)

- `typescript`
- `vitest`
- `eslint`
- `@typescript-eslint/parser`
- `@typescript-eslint/eslint-plugin`
- `prettier`
- `shx`
- `@types/node`

## Manual Installation from Source (macOS)

1. Clone source:

```bash
git clone https://github.com/hqu/opengov-mcp](https://github.com/hqu/opengov-mcp.git
cd opengov-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build:

```bash
npm run build
```

4. Verify build output exists:

```bash
ls dist/index.js
```

5. Configure Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "opengov": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/<YOUR_REPO_NAME>/dist/index.js"
      ],
      "env": {
        "DATA_PORTAL_URL": "https://data.cambridgema.gov"
      }
    }
  }
}
```

6. Restart Claude Desktop.

## Manual Installation from Source (Windows)

1. Clone source:

```powershell
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
cd <YOUR_REPO_NAME>
```

2. Install dependencies:

```powershell
npm install
```

3. Build:

```powershell
npm run build
```

4. Verify build output:

```powershell
dir dist\index.js
```

5. Configure Claude Desktop at:

`%APPDATA%\Claude\claude_desktop_config.json`

Use this config (example path shown):

```json
{
  "mcpServers": {
    "opengov": {
      "command": "node",
      "args": [
        "C:\\Users\\<YOUR_USER>\\source\\repos\\<YOUR_REPO_NAME>\\dist\\index.js"
      ],
      "env": {
        "DATA_PORTAL_URL": "https://data.cambridgema.gov"
      }
    }
  }
}
```

6. Restart Claude Desktop.

## Codex Desktop Task 1: Install This MCP in Codex Desktop

Add this MCP server to Codex Desktop MCP configuration using the same built `dist/index.js` entrypoint.

### macOS example

```json
{
  "mcpServers": {
    "opengov": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/<YOUR_REPO_NAME>/dist/index.js"
      ],
      "env": {
        "DATA_PORTAL_URL": "https://data.cambridgema.gov"
      }
    }
  }
}
```

### Windows example

```json
{
  "mcpServers": {
    "opengov": {
      "command": "node",
      "args": [
        "C:\\Users\\<YOUR_USER>\\source\\repos\\<YOUR_REPO_NAME>\\dist\\index.js"
      ],
      "env": {
        "DATA_PORTAL_URL": "https://data.cambridgema.gov"
      }
    }
  }
}
```

After saving config, fully restart Codex Desktop and confirm the MCP tool `get_data` appears.

## Codex Desktop Task 2: Debug and Fix Issues Using Prompts

Use prompts like these inside Codex Desktop:

1. Check build/runtime prerequisites:

```text
Validate this MCP setup. Confirm Node/npm versions, install deps, run npm run build, and report any errors with exact fixes.
```

2. Test the server process directly:

```text
Run node dist/index.js in this repo and check for startup errors. If it fails, identify root cause and patch code/config.
```

3. Validate MCP config paths:

```text
Inspect my MCP config and verify command/args paths are correct for my OS. Fix escaping issues for JSON paths.
```

4. Validate default portal connectivity:

```text
Use data.cambridgema.gov and run a minimal get_data catalog query. If it fails, debug network/domain/query issues and propose fixes.
```

5. End-to-end regression check before restart:

```text
Run npm test and npm run build, summarize failures by severity, and patch issues until both pass.
```

## Example Queries in Claude/Codex

```json
{
  "type": "catalog",
  "query": "snow",
  "limit": 5
}
```

```json
{
  "type": "dataset-metadata",
  "datasetId": "6zsd-86xi"
}
```

```json
{
  "type": "data-access",
  "datasetId": "6zsd-86xi",
  "query": "SELECT * ORDER BY :updated_at DESC LIMIT 10"
}
```
