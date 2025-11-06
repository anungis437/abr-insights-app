# Canadian Monetization Plan (Stripe)

Status: Draft
Last updated: 2025-11-05

## Overview


This document defines the monetization strategy for ABR Insights in Canada using Stripe (CAD). It includes pricing tiers, tax handling (GST/HST/PST/QST), feature gating, onboarding/billing flows, webhook handling, testing guidance, and data mappings to the application's subscription schema.

## Goals


- Provide clear, competitive CAD pricing for Free, Professional, and Enterprise tiers.
- Ensure Canadian tax compliance (GST/HST/PST/QST) via Stripe Tax.
- Implement robust billing workflows (checkout, billing portal, proration, grace periods).
- Support seat-based licensing for organizations and per-unit metering for select features.
- Keep sensitive card data off our servers (Stripe Elements/Checkout) for PCI scope reduction.
- Support auditability and reconciliation (invoices, webhooks, logs).

## Pricing & Feature Matrix (recommended)


- Free (CAD $0 / mo)
  - 1 user
  - Up to 3 courses
  - Basic tribunal search
  - No AI coaching
  - No analytics exports
  - Community support

- Professional (CAD $49 / mo)
  - Up to 10 users (seat-based)
  - All courses and lessons
  - Saved searches and AI coaching (limited to 10 sessions/mo)
  - Basic analytics dashboard
  - Email support
  - Billing: monthly or annual (10% discount on annual)

- Enterprise (CAD $299 / mo)
  - Unlimited users
  - All features, advanced analytics, SSO, dedicated support
  - Custom onboarding and training
  - Priority SLA
  - Enterprise billing (invoice/PO) optional

- Metered/Addon pricing (examples)
  - Extra seat: CAD $5 / seat / month
  - AI coaching overage: CAD $2 / session
  - Data ingestion overage: $0.10 per additional case ingested (example)

## Taxes & Compliance


- Use Stripe Tax to calculate taxes automatically at checkout and on invoices.
- Canada-specific guidance:
  - GST (5%) applies federally.
  - HST applies in provinces that use HST (ON 13%, NB/NL/NS/PE 15%).
  - QST applies in Quebec (9.975%) in addition to GST (apply via Stripe Tax rules).
  - PST applies in BC (7%), SK (6%), MB (7%), etc.
- Implementation:
  - Enable Stripe Tax and configure business location(s) as Canada.
  - Collect customer billing address at checkout to allow tax determination per province.
  - Use `tax_id` or `tax_exempt` fields where applicable for government/charity exemptions.
  - Include tax breakdown on invoices and store the applied tax rates in `invoices` table (columns for GST/HST/QST/PST cents are in schema).

## Subscription Model & Seats


- Organization-level subscriptions (one subscription row per `organization_id`) — already modeled in `subscriptions` and `subscription_seats`.
- Seat allocation flow:
  1. Admin purchases a subscription (Checkout) specifying number of seats.
  2. Create `subscriptions` row with Stripe IDs, seat_count, status.
  3. Create `subscription_seats` rows (status: 'available') for each seat.
  4. Admin assigns seats to users (assigned_to_user_id) or invite emails.
  5. Seat usage and overage monitored via `usage_tracking`.
- Seat assignment automation:
  - On successful payment or upgrade, create/activate seats.
  - Use webhooks to sync Stripe seat changes (quantity changes on Price/SubscriptionItem).

## Billing Workflows

- Checkout options:
  - Stripe Checkout session for simple subscription purchases (hosted checkout)
  - For Enterprise: Create subscription via API (server-side) and optionally create invoices for PO-based billing
- Billing portal:
  - Use Stripe Customer Portal for card updates, invoices, and subscription management. Integrate through a secure Azure Function that creates a portal session and returns a URL.
- Proration & upgrades/downgrades:
  - Use Stripe's proration logic by default. For predictable billing, consider `proration_behavior: 'none'` and issue credit notes. Document behavior in UI.
- Grace period & failed payments:
  - Implement a 7-day grace period for failed payments.
  - Use Stripe subscription `invoice.payment_failed` webhook to trigger email + 7-day countdown.
  - On final failure, mark subscription `status = 'past_due'` and after grace expiry `status = 'canceled'`.
- Refunds and disputes:
  - Use Stripe Dashboard for manual refunds.
  - Record refunds in `invoices` and `audit_logs` with `refund_reason`.

## Feature Gating & Access Control

- Use `subscription_tiers` and `subscriptions` tables. Implement server-side middleware (Azure Function or Supabase function) `checkSubscriptionAccess(user_id, feature_key)` that enforces:
  - Tier vs feature mapping
  - Seat availability
  - Overage charges
- UI:
  - Lock features client-side with upgrade CTAs. Server must always enforce checks.
- RLS:
  - Row-level policies should consider subscription status and org role. E.g., only allow `organization.members` to access org-level analytics when subscription `status='active'`.

## Stripe Integration Architecture

Components:

- Frontend: React app uses Stripe Checkout or Stripe Elements when collecting payment info. Prefer Checkout for speed and security.
- Backend: Azure Functions (Node.js/TypeScript) to handle server-side Stripe operations (create checkout session, create portal session, handle webhooks). Keep a small serverless surface.
- Database: Supabase subscriptions/invoices/payment_methods tables (schema exists in DATABASE_SCHEMA.md).

Key Functions (Azure Functions)

- `createCheckoutSession` (HTTP): create a Stripe Checkout session. Input: org_id, tier, seat_count, coupon_id (optional), billing_address. Output: session.url.
- `createPortalSession` (HTTP): create a Stripe Customer Portal session for the customer.
- `stripeWebhookHandler` (HTTP): main endpoint verifying signature and dispatching events.
- `syncStripeSubscription` (background/CRON): reconcile local DB with Stripe (daily or webhook-driven fallback).

Important Webhook Events to Handle

- `checkout.session.completed` → create subscription record, create seats, send welcome email.
- `invoice.paid` → mark invoice paid, update last_payment_date, create invoice record.
- `invoice.payment_failed` → notify admin, start grace period workflow.
- `customer.subscription.updated` → handle quantity changes (seats), status updates.
- `customer.subscription.deleted` → cancel subscription locally, mark seats suspended.
- `invoice.refund.updated` / `charge.refund.updated` → record refunds.
- `payment_intent.payment_failed` → surface to admin if immediate payment issues.

## Security & PCI

- Use Stripe Checkout or Elements. Do not transmit raw card data to our servers.
- Validate webhook signatures using Stripe's library and store `stripe_event_id` to avoid replay.
- Use idempotency keys on server-side subscription creation to prevent duplicate subscriptions.
- Secure Azure Function endpoints behind a verification layer and restrict IPs where possible.

## Testing & Sandbox

- Use Stripe test keys and the Stripe CLI to send webhooks locally.
- Use `stripe-mock` for deterministic API responses during unit/integration tests.
- Test card numbers (see Stripe docs) and simulate taxes by providing Canadian test addresses per province.
- Recommended Playwright tests:
  - Full checkout flow using test mode (create ephemeral customer and use the test cards)
  - Simulate `invoice.payment_failed` via Stripe CLI and assert seat suspension behavior.

## DB Mapping & Reconciliation


- On `checkout.session.completed` and `customer.subscription.created` store:
  - `subscriptions.stripe_subscription_id`
  - `stripe_customer_id`
  - `stripe_price_id`
  - `plan_tier`, `amount_cents`, `billing_interval`
- Sync invoices to `invoices` table with tax breakdown fields
- Use `usage_tracking` for metered features and create `invoice` items via Stripe Usage Records API when billing cycle ends

## Internationalization & Currency

- Primary currency: CAD. Show localized pricing in the UI with `Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })` and French equivalents for `fr-CA`.
- Store locale and language preference on `profiles` for invoice localization.

## Enterprise & Procurement


- For enterprise customers who require PO-based billing:
  - Offer `invoiced` billing (off-session) using `billing` set to `send_invoice` and `payment_settings` accordingly.
  - Create a manual Agreement record in `metadata` and support invoice approval workflow.
- Provide quota-based pricing and custom terms stored in `subscriptions.metadata`.

## Reporting & Reconciliation


- Reconcile Stripe payouts to bank statements weekly.
- Record accounting entries exported to CSV for finance (invoices, refunds, taxes).
- Track MRR, ARR, churn rate, LTV, and ARPA metrics.
- Keep an `audit_logs` entry for all billing-related webhook events and actions for 7+ years.

## Operational Considerations


- Webhook retry: idempotency + store event IDs to prevent duplicate processing.
- Offline payments: handle `incomplete`/`incomplete_expired` statuses gracefully.
- Notification flows: emails on trial ending, payment failed, invoice paid, plan changes.
- Graceful downgrades: when downgrading to fewer seats, mark seats as "available" and notify admins to reassign.

## Implementation Roadmap (High level)


Week 1: Stripe account setup, tax config, product/price creation, basic checkout integration (professional tier)
Week 2: Subscription persistence, seat allocation, portal integration, webhook handler
Week 3: Proration logic, upgrade/downgrade flows, grace period workflows
Week 4: Metered billing, usage tracking, enterprise invoicing
Week 5: QA & Playwright E2E tests, reconciliation scripts, deploy to staging

## Appendix


- Stripe docs: <https://stripe.com/docs>
- Stripe Tax: <https://stripe.com/docs/tax>
- Stripe Checkout: <https://stripe.com/docs/payments/checkout>
- Recommended testing: Stripe CLI (webhook testing), stripe-mock
