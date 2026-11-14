# Mermaid Online MCP — Mermaid Share Links & Source

Encode diagram source into share links and recover source from supported Mermaid share tokens, directly from a local MCP client. An independent open-source companion to [Mermaid Online](https://mermaidonline.org/), not an official Mermaid.js server.

This MCP serializes text. It **does not render diagrams, validate Mermaid syntax, fetch share URLs or read/write files**. For a visual editing workflow, use the separate [Mermaid Online editor](https://mermaidonline.org/), [Mermaid-to-SVG export](https://mermaidonline.org/mermaid-to-svg) or [Mermaid-to-PNG export](https://mermaidonline.org/mermaid-to-png).

## Install

Requires Node.js 22+ and an MCP client supporting local stdio servers. Common configuration:

```json
{"mcpServers":{"mermaidonline":{"command":"npx","args":["-y","mermaidonline-mcp@0.1.0"]}}}
```

Each client has its own configuration location. On Windows, if a client cannot spawn `npx`, install the package and use `node` with the absolute installed `src/cli.js` path instead. Running the command without a client starts a protocol server waiting on stdin. Use `npx -y mermaidonline-mcp@0.1.0 --help` for human-readable help.

## Two tools

| Tool | Arguments | Result |
| --- | --- | --- |
| `encode_mermaid_share` | `code`, optional `mermaidConfig` JSON string and explicit `baseUrl` | Reversible `pako:` token and optional URL |
| `decode_mermaid_share` | `share`, optional `includeState` | Original source and optionally untrusted extension/config data |

Ask your agent:

> Encode this flowchart into a share link using https://mermaidonline.org/ as the destination. Decode the result and verify the source round-trips. Do not render or open it.

```json
{"code":"flowchart LR\n  A[Write] --> B[Share]\n","baseUrl":"https://mermaidonline.org/"}
```

Destination is explicit, not silently substituted. No tracking parameters are added. Decoding accepts a token, fragment, or HTTP(S) URL and never requests that address. `includeState` defaults to false to avoid unnecessarily echoing config and extension fields.

## Limits and privacy

- Maximum source: 48,000 UTF-8 bytes; config: 8,000 UTF-8 bytes. Share tokens: 65,536 characters, decoded JSON: 65,536 UTF-8 bytes, container depth: 16. Results are limited to 128 KiB of JSON.
- A link contains the complete diagram state. It is reversible, **not encrypted or access controlled**. Compression is not redaction.
- Config is stored as data, not applied as renderer options. Treat recovered labels, links and directives as untrusted input to your editor.
- No URL fetching, uploads, file operations, telemetry, account, API key or paid backend calls. Your MCP client/model provider may still transmit or store tool input and output.
- `pako:`/`base64:` interoperability does not mean every site accepts every editor field. Unsupported legacy/site-specific fragments are rejected; diagram syntax is not checked.

See [share-link workflows and examples](docs/workflows.md). Core implementation: [mermaid-share-codec](https://github.com/j-river/mermaid-share-codec). Commercial website code remains separate.

## Verify

```sh
npm ci --ignore-scripts
npm run check
npm run audit:public
npm pack --dry-run
```

Tests negotiate a real MCP stdio session and exercise Unicode/config round trips, explicit destinations, source-only results, malicious schemes, corrupt payloads and bounded decompression. Registry metadata is in `server.json`; prepared metadata alone does not establish publication.

MIT. No customer diagrams or production credentials are included.
