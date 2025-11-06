# Tribunal Case Ingestion Module

Automated pipeline for discovering, fetching, classifying, and storing tribunal cases from public sources.

## Architecture

```
ingestion/
├── src/
│   ├── scrapers/          # Web scrapers for different sources
│   ├── classifiers/       # Rule-based + AI classification
│   ├── orchestrator/      # Main pipeline coordinator
│   ├── storage/           # Database interactions
│   ├── utils/             # Shared utilities
│   └── types/             # TypeScript type definitions
├── tests/                 # Unit and integration tests
├── scripts/               # CLI runners
└── config/                # Configuration files
```

## Quick Start

```bash
# Install dependencies
npm install

# Run ingestion job
npm run ingest:canlii -- --max-cases 20 --dry-run

# Run tests
npm test

# Run with monitoring
npm run ingest:canlii -- --source hrto --verbose
```

## Configuration

See `.env.local` for required environment variables:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_API_KEY`

## Documentation

See `docs/architecture/INGESTION_MODULE.md` for detailed architecture and design decisions.
