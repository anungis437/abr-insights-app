# Azure Functions: Requirements & Design

Status: Draft
Last updated: 2025-11-05

Purpose
-------

This document describes the serverless functions required to replace legacy Base44 server-side integrations and provide back-end behaviors for the ABR Insights platform on Azure. It covers trigger types, input/output contracts, security, scaling, retry semantics, monitoring, local development, CI/CD, cost considerations, and sample TypeScript templates.

Mapping to system goals
-----------------------

The functions implement the following application capabilities:

- Scheduled ingestion/scraping and promotion pipeline (SyncJob execution)
- AI classification (Azure OpenAI-backed) for cases and coaching
- Analytics aggregation for organization dashboards and leaderboards
- Transactional emails and notifications
- Stripe webhook handling and subscription reconciliation
- PDF / report generation (export)

Related docs
------------

- `docs/architecture/DATABASE_SCHEMA.md` — database tables and fields used by functions (ingestion_jobs, tribunal_cases_raw, tribunal_cases, classification_feedback, subscriptions, invoices, usage_tracking, audit_logs)
- `docs/architecture/MONETIZATION.md` — Stripe flows, events, and DB mapping
- `docs/development/TESTING_STRATEGY.md` — test guidance for functions

Azure service recommendations
-----------------------------

- Azure Functions (Premium plan for VNET, scale-to-zero + warm instances for predictable cold start) or Consumption with Durable Functions where long-running orchestration required
- Azure Key Vault for secrets (Stripe keys, OpenAI key, Supabase service role key)
- Azure Storage (Blobs + Queues) for temporary storage, DLQ and file artifacts
- Azure Service Bus (optional) for reliable message routing and DLQ
- Azure Application Insights for telemetry and distributed tracing
- Managed Identity for secure access to Key Vault and other Azure resources
- Azure Container Registry + Functions as container option where native dependencies are required

Common environment variables (store in Key Vault and reference via App Settings)

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (use Key Vault + Managed Identity; restrict access)
- OPENAI_API_KEY (Azure OpenAI endpoint / key)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SENDGRID_API_KEY or AZCOMM_CONNECTION_STRING
- STORAGE_ACCOUNT_CONNECTION_STRING
- APPINSIGHTS_INSTRUMENTATIONKEY (or use Application Insights extension)
- AZURE_SERVICEBUS_CONNECTION (if using Service Bus)
- LOG_LEVEL
- ADMIN_EMAILS (comma-separated)

Security & identity
-------------------

- Use Managed Identity for function-to-Azure-service auth where possible.
- Store sensitive secrets in Key Vault; never check them into source control.
- Validate all incoming webhooks using signature verification (Stripe) and replay protection (persist event ids in DB).
- Enforce input validation and size limits on all HTTP payloads.
- For ingestion that fetches external content, maintain a strict allowlist of source domains for scheduled scrapers, rate-limit fetchers and sandbox HTML parsing.

Observability
-------------

- Application Insights: track request rates, latency, exceptions, custom events (e.g., ingestion_job.complete, classification.failed)
- Structured logs (JSON), correlation IDs (X-Request-ID), and instrumentation across functions and front-end.
- Health endpoints and readiness probes for health checks.

Operational patterns
--------------------

- Use idempotent handlers (safe retries). Store operation IDs or stripe_event_id to prevent duplicate processing.
- Use queues for long-running tasks: HTTP -> enqueue -> worker function. This decouples triggering from processing and allows autoscaling.
- Dead-lettering: send failed messages to DLQ (Azure Storage Queue or Service Bus) for operator review.
- Retry policy: exponential backoff with capped retries; after N retries route to DLQ and notify admins.

Function list (detailed)
------------------------

Each function includes trigger, inputs, outputs, auth model, expected behavior, error handling, and suggested implementation notes.

1) tribunal-ingestion-cron

--------------------------

- Purpose: Execute scheduled SyncJobs (scrapers) to fetch new tribunal cases and push them to `tribunal_cases_raw`.
- Trigger: TimerTrigger (cron) — run at configurable times (e.g., daily 02:00 ET). Optionally support per-source cron stored in `tribunal_sources` and orchestrated by this function.
- Binding: Output to Azure Queue / Service Bus or directly write to Supabase via server-side service key.
- Input: None (reads active `tribunal_sources` and `sync_jobs` from Supabase).
- Output: Insert entries into `tribunal_cases_raw`, write logs to ingestion_jobs, push job progress messages to a queue for classification.
- Concurrency & scaling: Limit concurrent scrapers per tenant/source; use parallelism configured per source. Use consumption/plan with concurrency throttle.
- Error handling: On fetch or parse error, increment retry counters and continue; write errors to `ingestion_jobs.execution_log`.
- Idempotency: Use source + external_case_id pair to detect duplicates. If found, mark `is_duplicate` and link to existing `tribunal_cases`.
- Security: Outbound HTTP requests must use an internal proxy that enforces TLS and IP restrictions if needed.
- Notes: Use Playwright/Headless Chrome from containerized Functions or separate container job for JS-based scrapers requiring headless browser.

2) ingestion-processor (worker)

-------------------------------

- Purpose: Process `tribunal_cases_raw` entries: clean/extract content, run AI classification (invoke ai-classification function or call OpenAI), dedupe, and promote to `tribunal_cases` with proper lineage.
- Trigger: QueueTrigger (ingestion raw queue) OR Service Bus subscription.
- Binding: Read from queue; write to Supabase tables: `tribunal_cases`, `classification_feedback` as needed.
- Input: raw HTML/text payload or pointer to blob storage containing raw HTML
- Output: update `tribunal_cases_raw` status, create `tribunal_cases`, push event to audit/log queue
- Concurrency & scaling: Parallel workers allowed but use DB uniqueness constraints to avoid duplicates.
- Error handling: On failure, push message to DLQ after configured retries.
- Notes: Consider using a sidecar for heavy processing (image extraction, OCR).

3) ai-classification

--------------------

- Purpose: Run deterministic AI classification and tagging for a case (relevance, is_anti_black_specific, tags, confidence scores).
- Trigger: HTTPTrigger (internal) or QueueTrigger called from ingestion-processor.
- Binding: Calls Azure OpenAI (or Azure OpenAI SDK), returns JSON classification.
- Input: { raw_text, source, context_metadata }
- Output: classification JSON { is_race_related, is_anti_black, tags[], confidence }
- Security: Only callable from trusted back-end code (use function-level key or VNet + Managed Identity). Input size limited.
- Idempotency: Store classification model name + hash of input to prevent repeated reclassification or duplicate training records.
- Rate limiting: Implement per-tenant throttles and circuit breaker for OpenAI failures.
- Cost control: Provide confidence thresholds and fallback rules (rule-based) to avoid unnecessary calls.

4) ai-coaching (HTTP)

----------------------

- Purpose: Generate AI Coach sessions (prompt with learner context) and save results to `ai_coaching_sessions`.
- Trigger: HTTPTrigger (POST by front-end) authenticated via Supabase JWT or Azure AD token
- Binding: Calls Azure OpenAI; writes `ai_coaching_sessions` record to DB
- Input: { user_id, session_type, user_context } or server can fetch context from Supabase
- Output: { session_id, ai_response, recommended_courses }
- Security: Rate-limit per user/org; use token-based authentication and permission checks. Persist only sanitized user context for privacy.
- Cost control: Chargeback/consumption via usage_tracking for AI sessions when metered

5) analytics-aggregation

------------------------

- Purpose: Periodically refresh materialized views and compute aggregates used by `OrgDashboard`, leaderboards, and reports
- Trigger: TimerTrigger (hourly/daily) OR Durable Function orchestrator that performs incremental aggregation
- Input: Reads from DB (progress, certificates, user_achievements)
- Output: Update materialized views (org_analytics), write snapshots to analytics tables, push metrics to Application Insights
- Concurrency & scaling: Single instance run per schedule to avoid write conflicts, use advisory locks in DB
- Error handling: If refresh fails, retry with backoff; create incident alerts to admins

6) email-notifications (worker)

-------------------------------

- Purpose: Send transactional emails (welcome, certificate earned, ingestion alerts, payment notices)
- Trigger: QueueTrigger (notification queue) — functions or DB triggers enqueue messages
- Binding: Output to SendGrid or Azure Communication Service
- Input: notification payload { to, subject, template_key, data }
- Output: delivery receipt logged to `notifications` or `audit_logs`
- Delivery & retry: Use exponential retry; on persistent failure after N retries, send to DLQ and create alert
- Security: Sanitize templates to avoid injection. Use template engine with safe placeholders.

7) stripe-webhooks

------------------

- Purpose: Handle Stripe webhook events from `MONETIZATION.md` (checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, etc.)
- Trigger: HTTPTrigger (public endpoint) — validate `Stripe-Signature`
- Binding: Writes/updates `subscriptions`, `invoices`, `subscription_seats`, creates audit logs, triggers seat assignments/revocations
- Input: Stripe webhook event payload
- Output: DB updates; enqueue follow-up tasks (emails, seat assignment)
- Security: Verify signature with `STRIPE_WEBHOOK_SECRET`; idempotency using `stripe_event_id` column to avoid reprocessing
- Error handling: Return appropriate 2xx only after successful processing; log transient errors and allow Stripe to retry
- Notes: Keep this function lean — delegate heavy tasks to background worker queues (e.g., seat provisioning)

8) report-generation

--------------------

- Purpose: Generate PDF/CSV reports (org analytics, certification lists) and store artifacts in Azure Blob Storage, then provide signed URL
- Trigger: HTTPTrigger (on-demand) or QueueTrigger (background)
- Binding: Output to Blob Storage; create record in `reports` or `audit_logs` with blob_url
- Input: Report parameters (org_id, date_range, format)
- Output: blob URL, job status
- Implementation: Use Puppeteer in a container or a headless-rendering service for PDF rendering. For performance and scale, consider Azure Container Instances or durable function orchestrator.

9) stripe-usage-reconciliation (scheduled)

------------------------------------------

- Purpose: Periodic reconciliation between Stripe subscriptions/invoices and local DB; handle failed webhook cases
- Trigger: TimerTrigger (daily)
- Input: Query Stripe API + local DB
- Output: Fix discrepancies, raise alerts, write reconciliation results to `audit_logs`

10) admin-operations (HTTP)

---------------------------

- Purpose: Admin-only endpoints for maintenance (replay webhooks, reprocess raw cases, backfill classification)
- Trigger: HTTPTrigger (protected by admin role/managed identity)
- Implementation: Protect with Azure AD or custom admin token. Keep audit logs for every admin action.

Implementation notes & code templates
-----------------------------------

- Language: TypeScript (Node 18+ runtime) is recommended for parity with front-end tooling and existing JS code.
- Project layout suggestion:
  - /functions
    - /tribunal-ingestion-cron
    - /ingestion-processor
    - /ai-classification
    - /ai-coaching
    - /analytics-aggregation
    - /email-notifications
    - /stripe-webhooks
    - /report-generation
  - /shared
    - supabaseClient.ts (server-side service key via Key Vault)
    - logging.ts (AppInsights wrappers)
    - errorHelpers.ts
    - validators.ts

- Sample `stripe-webhooks` handler (TypeScript sketch):

```ts
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import Stripe from 'stripe'
import { getSecret } from '../shared/keyVault'
import { upsertStripeEvent } from '../shared/supabaseClient'

const stripeSecret = process.env.STRIPE_SECRET_KEY!
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-08-16' })

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const sig = req.headers['stripe-signature'] as string
  const payload = req.rawBody

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err) {
    context.log.error('Webhook signature verification failed', err)
    context.res = { status: 400, body: 'Invalid signature' }
    return
  }

  // Idempotency check
  const already = await upsertStripeEvent(event.id)
  if (already) {
    context.res = { status: 200, body: 'Already processed' }
    return
  }

  // Dispatch
  switch (event.type) {
    case 'checkout.session.completed':
      // Enqueue background job to create subscription record and seats
      break
    case 'invoice.paid':
      // Mark invoice paid
      break
    case 'invoice.payment_failed':
      // Start grace period workflow
      break
    default:
      context.log.info('Unhandled event', event.type)
  }

  context.res = { status: 200, body: 'ok' }
}

export default httpTrigger
```

Local development & testing
---------------------------

- Use `func` (Azure Functions Core Tools) to run functions locally.
- Use `dotenv` for local env vars; fetch secrets from Key Vault in CI/Prod.
- Use Stripe CLI to forward webhooks (`stripe listen --forward-to localhost:7071/api/stripe-webhooks`).
- Use recorded fixtures or `stripe-mock` to unit test webhook processing (avoid calling live Stripe in unit tests).
- For OpenAI calls, stub responses in unit tests and capture sample responses for integration tests.

CI/CD (GitHub Actions example)
------------------------------

- Build & Test job:
  - Checkout, install, `npm ci`, run `npm run build:functions`, run unit tests for functions
- Deploy job:
  - Use `azure/functions-action` to deploy function app using publish profile or use `az` CLI with Service Principal.
  - Use infra as code (ARM / Bicep / Terraform) to provision Function App, App Service Plan, Storage account, Key Vault secrets, Application Insights.

Example GH Actions (outline):

```yaml
name: functions-ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci --prefix functions
      - run: npm test --prefix functions
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: azure/functions-action@v1
        with:
          app-name: 'abr-insights-functions'
          package: './functions'
          publish-profile: ${{ secrets.AZURE_FUNC_PUBLISH_PROFILE }}
```

Testing guidance
-----------------

- Unit: mock Supabase and Azure SDKs (msw for HTTP stubs). Test validation and routing.
- Integration: run functions locally against a test Supabase instance. Use docker-compose for Postgres if Supabase service not available.
- E2E: Use Playwright for flows that exercise functions (ingestion triggers, webhook flows via Stripe CLI). Use a staging Azure subscription for full integration tests.

Cost & sizing notes
-------------------

- Ingestion & AI classification are the most expensive components (OpenAI costs + function execution time). Batch work and rate-limit AI calls.
- Use Premium plan for VNET and predictable cold starts for sensitive tenants; Consumption plan may be cost-effective for low-to-medium usage.
- Monitor egress, OpenAI cost, and Function execution duration; set alerts for cost thresholds.

Operational runbook (high level)
-------------------------------

- Incident: ingestion failures — check ingestion_jobs logs, inspect DLQ, reprocess raw entries.
- Incident: Stripe webhook errors — check webhook signature mismatches, replay event via Stripe CLI; reconcile subscriptions via `stripe-usage-reconciliation`.
- Incident: OpenAI failures — fallback to rule-based classification and mark for human review.

Next steps
----------

1. Scaffold function templates in `functions/` in this repo (TypeScript templates + shared clients). I can generate these files for a starter set: `stripe-webhooks`, `ai-classification`, `tribunal-ingestion-cron`, `ingestion-processor`, `analytics-aggregation`, `email-notifications`, `report-generation`.
2. Create GitHub Actions workflow for functions build & deploy, and IaC templates (Bicep/Terraform) for infra provisioning.
3. Create unit & integration tests for function handlers (using `msw`, fixtures, stripe-mock).

If you want, I'll scaffold the function templates next (recommended: start with `stripe-webhooks` + `tribunal-ingestion-cron` + `ingestion-processor`).
