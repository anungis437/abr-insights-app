# ABR Insights App

**Canada's Leading Anti-Black Racism Training & Analytics Platform**

ABR Insights is a comprehensive platform designed to help Canadian organizations combat anti-Black racism in the workplace through data-driven insights, expert-led training, and evidence-based decision making.

## 🎓 For Organizations & Professionals

### What is ABR Insights?

ABR Insights combines cutting-edge AI technology with comprehensive legal data to provide accessible, actionable resources that enable organizations to understand, address, and prevent anti-Black racism. Our platform offers:

- **📊 Tribunal Case Database** - Search and analyze 10,000+ Canadian human rights tribunal cases with AI-powered classification
- **📚 Expert Training Courses** - 50+ courses covering anti-Black racism, workplace equity, legal compliance, and allyship
- **🤖 AI-Powered Analytics** - Get personalized insights and recommendations powered by Azure OpenAI
- **📈 Progress Tracking** - Monitor organizational learning, earn certificates, and track equity initiatives
- **🎯 Evidence-Based Insights** - Make data-driven decisions with comprehensive analytics and reporting
- **🏆 Gamification** - Engage teams with achievements, leaderboards, and recognition systems

### Who Should Use ABR Insights?

- **HR Professionals** building equitable workplace policies and practices
- **DEI/EDI Leaders** implementing anti-racism training programs
- **Legal Teams** researching Canadian tribunal case law and precedents
- **Organizational Leaders** tracking equity initiatives and compliance
- **Trainers & Educators** teaching anti-racism and diversity courses
- **Canadian Employers** meeting legal obligations and creating inclusive cultures

### Getting Started as a User

1. **Visit** [abrinsights.ca](https://abrinsights.ca)
2. **Create an account** - Sign up with your organization email
3. **Explore the platform** - Browse tribunal cases, courses, and resources
4. **Start learning** - Enroll in courses or explore case database
5. **Track progress** - Monitor achievements and earn certificates
6. **Generate reports** - Use analytics to drive organizational change

### Key Features

#### For HR & EDI Professionals

- ✅ Access 10,000+ tribunal cases with advanced search and filtering
- ✅ AI-powered case classification and trend analysis
- ✅ Comprehensive training courses on anti-Black racism
- ✅ Downloadable compliance reports and analytics
- ✅ Track team progress and completion rates

#### For Trainers & Instructors

- ✅ Create and manage custom training courses
- ✅ Monitor learner engagement and outcomes
- ✅ Leverage tribunal cases as teaching materials
- ✅ Automated assessments and feedback
- ✅ CE credit tracking and certificates

#### For Organizations

- ✅ Multi-tenant support for team management
- ✅ Custom branding and organizational dashboards
- ✅ Advanced analytics on equity initiatives
- ✅ Role-based access control (RBAC)
- ✅ Enterprise-grade security and compliance
- ✅ API access for integrations

### Need Help?

- 📖 **User Guide** - See [docs/USER_GUIDE.md](docs/USER_GUIDE.md) for comprehensive instructions
- 🚀 **Quick Start** - Get up and running in 5 minutes with [docs/QUICK_START.md](docs/QUICK_START.md)
- 💬 **Support** - Contact us through the platform
- ❓ **FAQ** - Visit [/help](/help) for common questions
- 📧 **Contact** - [support@abrinsights.ca](mailto:support@abrinsights.ca)

---

## 💻 For Developers & Contributors

Below you'll find technical documentation for developers, contributors, and system administrators.

## 🎯 Production Status: World-Class Ready

ABR Insights has achieved **world-class production readiness** with all 9 production readiness PRs complete.

### Core Systems

| System             | Status  | Details                                   |
| ------------------ | ------- | ----------------------------------------- |
| Permission System  | ✅ 100% | 106 permissions, 48 API routes secured    |
| API Protection     | ✅ 100% | All endpoints authenticated & authorized  |
| Stripe Integration | ✅ 100% | Checkout, portal, webhooks, subscriptions |
| AI Features        | ✅ 100% | Chat, coach, embeddings, predictions      |
| Testing System     | ✅ 100% | 198+ automated tests, CI/CD pipeline      |
| **Build System**   | ✅ 100% | **Docker solution for exFAT drives**      |

### Production Readiness (9/9 PRs ✅)

| PR  | Area                    | Status | Key Features                                 |
| --- | ----------------------- | ------ | -------------------------------------------- |
| 01  | CSP Runtime Enforcement | ✅     | XSS protection, nonce-based policies         |
| 02  | CI Guardrails           | ✅     | Automated security checks, linting           |
| 03  | Structured Logging      | ✅     | Winston, correlation IDs, Azure Monitor      |
| 04  | Container Health        | ✅     | Health/readiness probes, metrics             |
| 05  | AI Cost Controls        | ✅     | Quota enforcement, budget alerts             |
| 06  | Data Lifecycle          | ✅     | Retention policies, GDPR compliance          |
| 07  | CanLII Compliance       | ✅     | Rate limiting, audit trails, TOU compliance  |
| 08  | Compliance Pack         | ✅     | 8 comprehensive compliance docs (~32k lines) |
| 09  | E2E Smoke Tests         | ✅     | 50+ critical flow tests, CI automation       |

**Achievement Date**: February 3, 2026  
**Documentation**: [WORLD_CLASS_PRODUCTION_READINESS_FINAL.md](docs/production-readiness/WORLD_CLASS_PRODUCTION_READINESS_FINAL.md)

> **⚠️ Windows Users on exFAT drives**: Use Docker build method - see [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)

ABR Insights is a Next.js-based learning management system that provides:

- 📚 **Course Management** - Complete course authoring and delivery platform
- 🎓 **Certification System** - Track progress and issue certificates
- 🏆 **Gamification** - Points, achievements, and leaderboards
- 🤖 **AI Assistant** - Intelligent tutoring and study support powered by Azure OpenAI
- 👥 **Multi-tenant RBAC** - Role-based access control with organization support
- 📊 **Analytics Dashboard** - Track learning metrics and progress
- 💳 **Stripe Integration** - Payment processing and subscription management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Azure AD/SAML SSO
- **Styling**: Tailwind CSS + shadcn/ui
- **Payment**: Stripe
- **AI**: Azure OpenAI (GPT-4, Embeddings)
- **Storage**: Supabase Storage + Azure Blob Storage
- **Logging**: Winston + Azure Monitor
- **Rate Limiting**: Redis (Upstash)
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Azure Static Web Apps + Container Apps

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

### Production Build

#### For NTFS Drives (C:\)

```bash
npm run build
npm start
```

#### For exFAT Drives (External Drives) - Use Docker

If you encounter `EISDIR` webpack errors on external drives:

```powershell
# Windows PowerShell
.\docker-build.ps1 -Clean -Extract

# Test production build
.\docker-build.ps1 -Run
```

**See**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) for complete Docker build guide

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

### 🚀 Production Readiness Documentation

- **[World-Class Production Readiness](docs/production-readiness/WORLD_CLASS_PRODUCTION_READINESS_FINAL.md)** - Complete 9-PR framework (100%)
- **[Compliance Pack](docs/compliance/)** - 8 comprehensive compliance documents (~32k lines)
  - [Security Overview](docs/compliance/SECURITY_OVERVIEW.md)
  - [Access Control & RBAC](docs/compliance/ACCESS_CONTROL_RBAC.md)
  - [Data Retention](docs/compliance/DATA_RETENTION.md)
  - [CanLII Compliance](docs/compliance/CANLII_COMPLIANCE.md)
  - [AI Cost Controls](docs/compliance/AI_COST_CONTROLS.md)
  - [CSP Validation Proof](docs/compliance/CSP_VALIDATION_PROOF.md)
  - [Incident Response](docs/compliance/INCIDENT_RESPONSE.md)
  - [Operational Runbook](docs/compliance/RUNBOOK.md)

### 📚 Complete System Documentation (100%)

- **[Documentation Index](docs/INDEX.md)** - Master index with all guides
- **[Permission System 100%](docs/completion-guides/PERMISSION_SYSTEM_100_COMPLETE.md)** - Complete RBAC implementation
- **[API Protection 100%](docs/completion-guides/API_PROTECTION_100_COMPLETE.md)** - All 48 endpoints secured
- **[Stripe Integration 100%](docs/completion-guides/STRIPE_INTEGRATION_100_COMPLETE.md)** - Complete payment system
- **[AI Features 100%](docs/completion-guides/AI_FEATURES_100_COMPLETE.md)** - Chat, coach, embeddings, predictions
- **[Testing System 100%](docs/completion-guides/TESTING_100_COMPLETE.md)** - 198+ tests, CI/CD pipeline

### 📚 Setup & Configuration

- [Setup Complete Guide](docs/completion-guides/SETUP_COMPLETE.md)
- [Authentication Setup](AUTH_SETUP_GUIDE.md)
- [Stripe Setup](STRIPE_SETUP.md)
- [Security Status](PRODUCTION_SECURITY_STATUS.md)

### 🗂️ Additional Resources

- [Migration Guide](MANUAL_MIGRATION_GUIDE.md)
- [RBAC Documentation](docs/security/RBAC_DOCUMENTATION.md)
- [Architecture Docs](docs/architecture/)
- [Deployment Guides](docs/deployment/)

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
