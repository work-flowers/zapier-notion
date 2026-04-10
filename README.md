# Notion (Unofficial by work.flowers)

Private Zapier integration adding functionality beyond the official Notion integration.

Built with [Zapier Platform CLI](https://github.com/zapier/zapier-platform) against Notion API version `2026-03-11`.

## Triggers

### New User
Triggers when a new user is added to the workspace.

### New Block
Triggers when a new block of a specific type appears in a data source.

- **Data Source** — dynamic dropdown of available data sources
- **Block Type** — the block type to filter on (defaults to `meeting_notes`)

### New Unsupported Block
Triggers when a new block of a specific unsupported type appears in a data source. Designed for block types not yet officially supported by the Notion API (e.g. `mail`).

- **Data Source** — dynamic dropdown of available data sources
- **Unsupported Block Type** — the `unsupported.block_type` value to filter on (defaults to `mail`)

Both block triggers poll the most recently created pages (up to 20) in the data source and scan their child blocks for matches. Each matching block fires individually (deduplicated by block ID). Returns a `block_url` field with the full Notion URL (page + block fragment) for use with Notion MCP.

## Searches

### Find Blocks by Type
Finds child blocks of a specific type within a page.

- **Page ID** — the Notion page to search
- **Block Type** — the block type to filter for (defaults to `meeting_notes`)

Returns all matching blocks with enriched `block_url`, `parent_page_id`, and `parent_page_url` fields. Useful as a follow-up action after the native Notion integration's data source item trigger.

## Setup

```bash
npm install
cp .env.example .env  # Add your Notion API key
```

## Development

```bash
npx jest                    # Run tests
zapier-platform validate    # Validate schema
zapier-platform push        # Deploy
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `API_KEY` | Notion internal integration token (`ntn_...`) |
