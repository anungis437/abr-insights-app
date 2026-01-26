# ABR Insights App

A comprehensive legal education platform focused on African Bar Review (ABR) training and professional development.

## Overview

ABR Insights is a Next.js-based learning management system that provides:

- 📚 **Course Management** - Complete course authoring and delivery platform
- 🎓 **Certification System** - Track progress and issue certificates
- 🏆 **Gamification** - Points, achievements, and leaderboards
- 🤖 **AI Assistant** - Intelligent tutoring and study support
- 👥 **Multi-tenant RBAC** - Role-based access control with organization support
- 📊 **Analytics Dashboard** - Track learning metrics and progress
- 💳 **Stripe Integration** - Payment processing for premium content

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Payment**: Stripe
- **AI**: Azure OpenAI
- **Storage**: Supabase Storage
- **Deployment**: Azure Static Web Apps

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/anungis437/abr-insights-app.git
cd abr-insights-app
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

- Supabase URL and keys
- Stripe API keys
- OpenAI API key
- Other service credentials

1. Run database migrations:

```bash
# Migrations are managed through Supabase CLI or dashboard
# See docs/migration/ for migration guides
```

1. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```text
├── app/                    # Next.js app directory
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Shared components
├── docs/                  # Documentation
│   ├── guides/           # Setup guides
│   ├── migration/        # Migration documentation
│   ├── planning/         # Project planning
│   └── security/         # Security documentation
├── lib/                   # Utility libraries
├── scripts/              # Database and utility scripts
├── supabase/             # Supabase migrations and functions
└── tests/                # Test files

```

## Documentation

- [Setup Complete Guide](docs/SETUP_COMPLETE.md)
- [Authentication Setup](docs/guides/AUTH_SETUP_GUIDE.md)
- [Stripe Integration](docs/guides/STRIPE_SETUP.md)
- [Migration Guide](docs/migration/MIGRATION_GUIDE.md)
- [RBAC Documentation](docs/RBAC_DOCUMENTATION.md)
- [Security Status](docs/security/PRODUCTION_SECURITY_STATUS.md)

## Scripts

Common scripts available in the `scripts/` folder:

- Database migrations and validation
- User management and role assignment
- Test data creation
- Schema verification

Run scripts with Node.js:

```bash
node scripts/[script-name].mjs
```

## Testing

Run tests with:

```bash
npm test
```

## Deployment

The app is configured for deployment on Azure Static Web Apps. See [Deployment Documentation](docs/deployment/) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See [LICENSE](LICENSE) file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the development team
