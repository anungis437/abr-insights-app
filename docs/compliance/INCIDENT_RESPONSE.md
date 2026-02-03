# Incident Response Plan

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: Production Ready

## Executive Summary

This document outlines ABR Insights App's incident response procedures for security incidents, data breaches, and operational failures. Our incident response framework follows NIST 800-61r2 guidelines and ensures 30-minute response time for critical incidents.

**Key Contacts**:

- **Security Team**: <security@abr-insights.com>
- **On-Call Engineer**: PagerDuty escalation
- **Compliance Officer**: <compliance@abr-insights.com>
- **Legal**: <legal@abr-insights.com>

## Incident Classification

### Severity Levels

#### P0 - Critical (Response: Immediate, SLA: 15 minutes)

- **Data breach** (customer data exposed)
- **Complete service outage** (all tenants affected)
- **Active security attack** (ongoing intrusion)
- **Payment system compromise** (Stripe webhook tampering)

**Escalation**: Immediate PagerDuty page, executive notification

#### P1 - High (Response: 30 minutes)

- **Partial service outage** (single tenant or feature)
- **Security vulnerability** (unpatched critical CVE)
- **API abuse** (rate limits bypassed, quota exhaustion)
- **Data integrity issue** (corrupted data, incorrect billing)

**Escalation**: PagerDuty page, security team notification

#### P2 - Medium (Response: 2 hours)

- **Performance degradation** (slow response times)
- **Failed health checks** (single instance unhealthy)
- **CSP violations** (repeated from same source)
- **Third-party service degradation** (Supabase, Stripe)

**Escalation**: Slack notification, incident ticket

#### P3 - Low (Response: 24 hours)

- **Non-critical bugs** (UI issues, cosmetic errors)
- **Routine maintenance** (scheduled downtime)
- **Low-volume CSP violations** (isolated incidents)

**Escalation**: GitHub issue

## Incident Response Process

### Phase 1: Detection & Alert

**Detection Sources**:

1. **Automated Monitoring**:
   - Azure Container Apps health checks
   - Supabase error alerts
   - CSP violation reports
   - Structured logging (ERROR level)
   - Rate limit exceeded alerts
   - AI quota warnings

2. **User Reports**:
   - Support tickets (`support@abr-insights.com`)
   - Social media monitoring
   - Community forums

3. **Security Scanning**:
   - Dependabot vulnerability alerts
   - GitHub secret scanning
   - CI pipeline failures

**Alert Routing**:

```
Detection → Structured Logging → Log Aggregation → Alert Rules → PagerDuty/Slack
```

### Phase 2: Triage & Classification

**On-Call Engineer Actions** (5 minutes):

1. **Acknowledge Alert**:
   - PagerDuty: Acknowledge incident
   - Slack: Post in `#incidents` channel
   - Create incident ticket (Jira/Linear)

2. **Assess Severity**:
   - Number of affected users/tenants
   - Data exposure risk
   - Service availability impact
   - Business impact (billing, legal)

3. **Classify Incident**:
   - Assign severity (P0-P3)
   - Tag incident type (security, availability, performance)
   - Identify affected components

4. **Escalate if Needed**:
   - P0: Page security team + executive
   - P1: Page security team
   - P2: Notify security team via Slack
   - P3: Create ticket, no immediate escalation

### Phase 3: Containment

**Immediate Actions** (15-30 minutes):

#### For Data Breaches (P0)

1. **Isolate Affected Systems**:
   - Revoke compromised API keys
   - Rotate database credentials
   - Block attacker IP addresses
   - Enable CSP report-only mode (if CSP issue)

2. **Preserve Evidence**:
   - Export logs (correlation ID, user ID, timestamps)
   - Screenshot attacker activity
   - Database snapshot before remediation
   - Network traffic captures

3. **Stop Data Exfiltration**:
   - Rate limit aggressive IPs
   - Block affected user sessions
   - Disable compromised integrations

#### For Service Outages (P0/P1)

1. **Failover to Backup**:
   - Switch to read-replica (if DB issue)
   - Enable maintenance mode (graceful degradation)
   - Redirect traffic to backup region

2. **Kill Switches**:
   - **CanLII Ingestion**: `CANLII_INGESTION_ENABLED=false`
   - **AI Features**: Reduce quotas to 0 via admin dashboard
   - **CSP**: Switch to report-only mode

3. **Communication**:
   - Post status page update (status.abr-insights.com)
   - Email affected customers (template below)
   - Internal Slack notification

#### For Security Attacks (P0)

1. **Block Attacker**:
   - IP ban (Azure Firewall)
   - Rate limit to 0 req/sec
   - Revoke attacker's session tokens

2. **Assess Damage**:
   - Query audit logs for attacker actions
   - Check for privilege escalation
   - Verify no data was exfiltrated

3. **Notify Authorities** (if required):
   - Law enforcement (for criminal activity)
   - Privacy regulators (for GDPR breach)
   - Customers (within 72 hours for GDPR)

### Phase 4: Investigation

**Root Cause Analysis** (1-4 hours):

1. **Log Analysis**:
   - Use correlation ID to trace request flow
   - Identify first occurrence (Patient Zero)
   - Check for similar incidents in past 90 days

2. **Code Review**:
   - Review recent deployments (git log)
   - Check for introduced vulnerabilities
   - Identify code path that caused issue

3. **Database Forensics**:
   - Check for unauthorized queries (audit log)
   - Verify RLS policies applied
   - Identify data accessed/modified

4. **Timeline Reconstruction**:
   - Document incident start time
   - List attacker actions (chronological)
   - Identify detection delay (time to alert)

**Investigation Tools**:

- Structured logs: `/api/logs?correlationId={id}`
- Database audit: `SELECT * FROM audit_log WHERE timestamp > '...'`
- Git history: `git log --since="2 hours ago"`
- Supabase dashboard: Real-time queries, slow query log

### Phase 5: Eradication

**Remediation Actions**:

#### Code Fixes

1. **Deploy Hotfix**:
   - Create hotfix branch: `hotfix/incident-{id}`
   - Fix vulnerability (parameterized queries, input validation)
   - CI pipeline must pass (no bypassing)
   - Deploy to production (fast-track approval)

2. **Rollback if Needed**:
   - Revert to last known good deployment
   - Database rollback (if schema change)
   - Clear caches (Redis FLUSHALL)

#### Configuration Changes

1. **Rotate Secrets**:
   - Database passwords
   - API keys (Stripe, OpenAI, CanLII)
   - JWT signing keys (force re-auth)

2. **Tighten Security**:
   - Reduce rate limits temporarily
   - Enable stricter CSP directives
   - Increase logging verbosity (DEBUG level)

#### Database Cleanup

1. **Remove Malicious Data**:
   - Delete injected records
   - Restore from backup (point-in-time recovery)
   - Verify data integrity (checksums)

2. **Revoke Access**:
   - Expire compromised user sessions
   - Reset passwords for affected users
   - Disable compromised admin accounts

### Phase 6: Recovery

**Restoration Actions** (30 minutes - 4 hours):

1. **Service Restoration**:
   - Re-enable disabled features (CanLII, AI)
   - Remove IP bans (if false positive)
   - Switch CSP back to enforce mode

2. **Verification**:
   - Health checks pass (`/api/health/ready`)
   - User login successful (test accounts)
   - Critical flows work (course enrollment, billing)
   - No errors in logs (5-minute window)

3. **Monitoring**:
   - Watch for recurrence (1-hour window)
   - Check for attacker return (IP patterns)
   - Monitor resource usage (CPU, memory, DB connections)

4. **Status Update**:
   - Post "Resolved" on status page
   - Email customers (incident resolved)
   - Internal all-clear message

### Phase 7: Post-Incident Review

**Post-Mortem** (within 48 hours):

**Blameless Review**:

- What happened? (timeline)
- Why did it happen? (root cause)
- How was it detected? (alert source)
- What worked well? (quick response)
- What could improve? (detection delay)
- Action items (preventive measures)

**Documentation**:

- Create post-mortem doc: `docs/incidents/YYYY-MM-DD-{title}.md`
- Share with engineering team
- Update runbook if needed
- Add to incident knowledge base

**Follow-Up Actions**:

- Implement preventive measures (CI checks, better validation)
- Schedule training (if process gap)
- Update monitoring (better alerts)
- Customer communication (transparency)

## Kill Switches

### 1. CanLII Ingestion Kill Switch

**Purpose**: Emergency stop for CanLII API ingestion (compliance)

**Activation**:

```bash
# Set environment variable
export CANLII_INGESTION_ENABLED=false

# Or in .env
CANLII_INGESTION_ENABLED=false

# Restart containers
az containerapp revision restart --name abr-insights-app
```

**Effect**:

- All ingestion runs blocked
- In-progress runs stopped mid-execution
- Status set to 'killed' in database
- Audit log records kill switch activation

**Reactivation**:

```bash
export CANLII_INGESTION_ENABLED=true
az containerapp revision restart --name abr-insights-app
```

### 2. AI Quota Emergency Stop

**Purpose**: Stop AI abuse (cost attack, quota exhaustion)

**Activation** (via admin dashboard):

1. Navigate to `/admin/ai-quotas`
2. Set org quota to 0: `Monthly Quota: 0`
3. Click "Update Quota"

**Effect**:

- All AI requests blocked immediately
- Users see "AI quota exceeded" message
- Existing requests complete (no interruption)

**Reactivation**:

- Restore quota to normal value (e.g., 10,000/month)

### 3. CSP Report-Only Mode

**Purpose**: Investigate CSP violations without blocking requests

**Activation**:

```typescript
// middleware.ts
const cspHeader = `
  Content-Security-Policy-Report-Only: ...
` // Change from Content-Security-Policy
```

**Effect**:

- CSP violations reported but not enforced
- Scripts/styles still execute (even if violating)
- Violations logged for investigation

**Reactivation**:

- Change back to `Content-Security-Policy` (enforce mode)

## Communication Templates

### Internal Alert (Slack)

```
🚨 **INCIDENT DETECTED** 🚨

**Severity**: P0 - Critical
**Type**: Data Breach
**Affected**: Organization "Nzila Law Firm" (50 users)
**Detection**: CSP violation report (unauthorized script execution)
**On-Call**: @john.doe
**Status**: Containment in progress

**Action Items**:
- [ ] Isolate affected organization
- [ ] Revoke compromised sessions
- [ ] Preserve evidence (logs exported)
- [ ] Notify security team
- [ ] Notify legal team

**Incident Ticket**: INC-2026-02-03-001
**War Room**: https://meet.google.com/incident-room
```

### Customer Notification (Email)

**Subject**: Security Incident Notification - Action Required

```
Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your ABR Insights account.

**What Happened**:
On February 3, 2026 at 10:30 AM EST, we detected unauthorized access to a subset of user accounts, including yours. The attacker exploited a vulnerability in our authentication system that has since been patched.

**What Data Was Affected**:
- Name, email address
- Course enrollment records
- Quiz submission history
- NO payment information was accessed (Stripe handles all payments)
- NO passwords were exposed (hashed with bcrypt)

**What We've Done**:
- Patched the vulnerability (deployed at 11:00 AM EST)
- Revoked all active sessions (you will need to log in again)
- Reset your password as a precaution
- Notified relevant authorities

**What You Should Do**:
1. Log in with your new temporary password: [LINK]
2. Set a new password (different from previous)
3. Enable two-factor authentication (2FA)
4. Monitor your account for suspicious activity

**Questions**:
Contact our security team at security@abr-insights.com or call +1-XXX-XXX-XXXX.

We sincerely apologize for this incident and are taking additional measures to prevent future occurrences.

Sincerely,
ABR Insights Security Team
```

### Status Page Update

```
🔴 **Service Disruption** (2026-02-03 10:30 AM EST)

We are investigating reports of users unable to access courses. Our engineering team is actively working on a resolution.

**Affected Services**:
- Course enrollment
- Quiz submission
- AI assistant

**Not Affected**:
- Login/authentication
- Billing

**Next Update**: 11:00 AM EST (30 minutes)

---

🟡 **Update** (2026-02-03 11:15 AM EST)

We have identified the root cause (database connection pool exhaustion) and deployed a fix. Services are being restored gradually.

**Status**:
- Course enrollment: ✅ Restored
- Quiz submission: ✅ Restored
- AI assistant: 🟡 Restoring (ETA: 15 minutes)

---

🟢 **Resolved** (2026-02-03 11:30 AM EST)

All services have been fully restored. We will publish a post-mortem within 48 hours detailing the incident and preventive measures.

Thank you for your patience.
```

## Regulatory Notifications

### GDPR Breach Notification (72-Hour Deadline)

**Notify**: Privacy regulator in customer's jurisdiction

**Information Required**:

1. Nature of breach (what happened)
2. Categories of data affected (PII, payment, health)
3. Approximate number of affected individuals
4. Consequences for individuals (identity theft risk, financial loss)
5. Measures taken to mitigate (password reset, monitoring)
6. Contact details for more information

**Template**: Available at `docs/legal/GDPR_BREACH_NOTIFICATION.docx`

### CCPA Breach Notification (No Specific Deadline)

**Notify**: California Attorney General (if > 500 residents affected)

**Information Required**:

1. Name and contact of reporting entity
2. Type of breach (unauthorized access, disclosure)
3. Number of California residents affected
4. Date of breach
5. Brief description of breach

**Template**: Available at `docs/legal/CCPA_BREACH_NOTIFICATION.docx`

## Incident Metrics

### Key Performance Indicators (KPIs)

- **Mean Time to Detect (MTTD)**: Target < 5 minutes
- **Mean Time to Acknowledge (MTTA)**: Target < 5 minutes (P0), < 30 minutes (P1)
- **Mean Time to Contain (MTTC)**: Target < 30 minutes (P0), < 2 hours (P1)
- **Mean Time to Resolve (MTTR)**: Target < 4 hours (P0), < 24 hours (P1)

### Incident Log (2026)

| Date                                   | ID      | Severity | Type         | MTTR | Root Cause         | Preventive Action               |
| -------------------------------------- | ------- | -------- | ------------ | ---- | ------------------ | ------------------------------- |
| 2026-02-01                             | INC-001 | P2       | Performance  | 1.5h | Slow query         | Add index on courses.created_at |
| 2026-02-02                             | INC-002 | P1       | Availability | 30m  | DB connection pool | Increase max connections        |
| (Future incidents will be logged here) |

## Training & Drills

### Incident Response Training

**Frequency**: Quarterly

**Topics**:

- Incident classification (P0-P3)
- Kill switch activation
- Evidence preservation
- Customer communication
- Regulatory compliance

**Drills**:

- Simulated data breach (tabletop exercise)
- Service outage simulation (chaos engineering)
- CSP violation investigation
- Customer notification drafting

### On-Call Rotation

**Schedule**: 1-week rotations, 24/7 coverage

**Responsibilities**:

- Acknowledge incidents within 5 minutes
- Triage and classify severity
- Execute containment procedures
- Escalate to security team if needed
- Document incident timeline

**On-Call Checklist**:

- [ ] PagerDuty app installed and notifications enabled
- [ ] VPN access configured (remote troubleshooting)
- [ ] Admin access to Azure, Supabase, Stripe
- [ ] Runbook reviewed (current week's changes)
- [ ] Contact list updated (escalation paths)

## Related Documents

- [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md): Security architecture
- [RUNBOOK.md](./RUNBOOK.md): Operational procedures
- [DATA_RETENTION.md](./DATA_RETENTION.md): Data handling policies

---

**Document History**:

- v1.0 (2026-02-03): Initial version (PR-08 compliance pack)
