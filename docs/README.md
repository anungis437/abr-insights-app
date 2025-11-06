# ABR Insights App Documentation

Welcome to the ABR Insights App documentation. This comprehensive guide covers all aspects of the application from architecture to deployment.

## Table of Contents

### Architecture

- [Refactor Strategy](./architecture/REFACTOR.md) - Migration from Base44 to Supabase + Azure
- [RBAC & Governance](./architecture/RBAC_GOVERNANCE.md) - 🔐 Enterprise-grade security for Canadian standards
- [Ingestion Module](./architecture/INGESTION_MODULE.md) - Automated tribunal data scraping and classification
- [System Design](./architecture/SYSTEM_DESIGN.md) - Overall architecture and patterns
- [Database Schema](./architecture/DATABASE_SCHEMA.md) - Supabase database design
- [Security Model](./architecture/SECURITY.md) - Authentication, authorization, and data protection

### API Documentation

- [Supabase API Guide](./api/SUPABASE_API.md) - Database queries and real-time subscriptions
- [Azure Functions](./api/AZURE_FUNCTIONS.md) - Serverless functions and APIs
- [External Integrations](./api/INTEGRATIONS.md) - Third-party services (OpenAI, Azure AI, etc.)

### Development

- [Getting Started](./development/GETTING_STARTED.md) - Local development setup
- [Coding Standards](./development/CODING_STANDARDS.md) - Style guide and best practices
- [Testing Strategy](./development/TESTING.md) - Unit, integration, and E2E tests
- [Component Library](./development/COMPONENTS.md) - shadcn/ui components usage

### Deployment

- [Azure Static Web Apps](./deployment/AZURE_SWA.md) - Deployment configuration
- [CI/CD Pipeline](./deployment/CICD.md) - GitHub Actions workflows
- [Environment Variables](./deployment/ENVIRONMENT.md) - Configuration management
- [Monitoring & Logging](./deployment/MONITORING.md) - Application insights and diagnostics

## Quick Links

- **Project Repository**: [abr-insights-app](https://github.com/anungis437/abr-insights-app)
- **Production URL**: TBD
- **Staging URL**: TBD
- **Supabase Dashboard**: TBD
- **Azure Portal**: TBD

## Contributing

Please read the [Coding Standards](./development/CODING_STANDARDS.md) before contributing to the project.

## Version History

- **v2.0.0** (2025-11) - Complete refactor with Supabase + Azure Static Web Apps
- **v1.0.0** (Legacy) - Base44-based implementation

## Support

For questions or issues, please contact the development team or create an issue in the repository.
