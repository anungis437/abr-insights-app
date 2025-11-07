# ABR Insights App

Anti-Black Racism Insights Platform - A comprehensive bilingual learning management system with AI-powered tribunal case explorer.

## Features

- 🎓 **Expert Training Courses**: Interactive learning paths with gamification
- ⚖️ **AI-Powered Case Explorer**: Search 10,000+ tribunal decisions with semantic search
- 📊 **Analytics Dashboard**: Track progress and measure impact
- 🌐 **Bilingual Support**: Full English and French content
- 🔒 **Enterprise Security**: Row-level security and RBAC
- 💳 **Flexible Pricing**: Freemium model with tiered subscriptions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI/ML**: Azure OpenAI (GPT-4o, text-embedding-ada-002)
- **Payments**: Stripe
- **Hosting**: Azure Static Web Apps
- **Monitoring**: Application Insights

## Prerequisites

- Node.js 18+ and npm 9+
- Supabase project
- Azure OpenAI deployment
- Stripe account (test mode for development)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `STRIPE_SECRET_KEY`: Stripe secret key

See [docs/deployment/ENVIRONMENT.md](docs/deployment/ENVIRONMENT.md) for complete list.

### 3. Database Setup

Apply Supabase migrations:

```bash
cd supabase
supabase db push
```

Or manually apply migrations from `supabase/migrations/` directory in order.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility libraries (Supabase, etc.)
├── public/                 # Static assets
├── ingestion/             # Automated case ingestion system
│   ├── src/               # Scrapers, classifiers, orchestrator
│   └── tests/             # Unit tests (35 tests, all passing)
├── scripts/               # Utility scripts for DB, testing, AI
├── docs/                  # Comprehensive documentation
│   ├── design/            # Design specs
│   ├── deployment/        # Deployment docs
│   ├── architecture/      # Technical architecture
│   └── ingestion/         # Ingestion system docs
├── supabase/              # Database migrations and types
│   └── migrations/        # SQL migration files
└── legacy/                # Legacy React app (deprecated)
```

## Documentation

Comprehensive documentation available in `docs/`:

### Design & Architecture
- [Database Schema](docs/architecture/DATABASE_SCHEMA.md)
- [API Documentation](docs/architecture/API_DOCUMENTATION.md)
- [AI/ML Architecture](docs/architecture/AI_ML_ARCHITECTURE.md)
- [Public Site Strategy](docs/design/PUBLIC_SITE_STRATEGY.md)

### Development
- [Testing Strategy](docs/development/TESTING_STRATEGY.md)
- [RBAC & Governance](docs/architecture/RBAC_GOVERNANCE.md)

### Deployment
- [Environment Configuration](docs/deployment/ENVIRONMENT.md)
- [Azure Static Web Apps Setup](docs/deployment/AZURE_SWA.md)
- [CI/CD Pipeline](docs/deployment/CICD.md)
- [Monitoring & Alerts](docs/deployment/MONITORING.md)

### Business
- [Monetization Strategy](docs/business/MONETIZATION.md)

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

- `npm run test` - Run Vitest unit tests
- `npm run test:unit` - Run unit tests with coverage
- `npm run test:e2e` - Run Playwright E2E tests

### Ingestion

- `npm run ingest` - Run case ingestion pipeline
- `npm run ingest -- --demo` - Run with demo data
- `npm run ingest -- --dry-run` - Test mode (no DB writes)

## Running Tests

```bash
# All tests (unit + integration)
npm run test

# Unit tests with coverage
npm run test:unit -- --coverage

# E2E tests
npm run test:e2e
```

Test Status: **35/35 passing** ✅ (33 unit tests + 2 skipped integration tests)

## Production Deployment

### Azure Static Web Apps

1. Create Azure Static Web App resource
2. Configure GitHub Actions (see `.github/workflows/azure-static-web-apps.yml`)
3. Set environment variables in Azure Portal
4. Deploy via GitHub push to `main` branch

See [docs/deployment/AZURE_SWA.md](docs/deployment/AZURE_SWA.md) for detailed instructions.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Create a Pull Request

## License

UNLICENSED - Proprietary software

## Support

- **Documentation**: Check `docs/` directory
- **Issues**: Create a GitHub issue
- **Contact**: <devops@abrinsights.ca>

---

Built with ❤️ by the ABR Insights Team
