# Operations Runbook

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: Production Ready

## Executive Summary

This runbook provides operational procedures for ABR Insights App, including deployment, monitoring, troubleshooting, kill switches, and restore procedures. Intended for on-call engineers and operations team.

**On-Call SLA**:

- P0 (Critical): 15-minute response
- P1 (High): 30-minute response
- P2 (Medium): 2-hour response

**Critical Contacts**:

- **On-Call**: PagerDuty rotation
- **Security**: security@abr-insights.com
- **Engineering Lead**: +1-XXX-XXX-XXXX

## System Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────┐
│                  Azure Container Apps                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Next.js App (3 replicas)                  │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  Middleware (CSP, RBAC, Rate Limiting)      │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────────┐
        │           │           │               │
        ▼           ▼           ▼               ▼
   ┌────────┐  ┌────────┐  ┌─────────┐   ┌──────────┐
   │Supabase│  │ Redis  │  │ Stripe  │   │  OpenAI  │
   │(Postgres│  │(Cache/ │  │(Billing)│   │  (AI)    │
   │  +Auth)│  │Limits) │  └─────────┘   └──────────┘
   └────────┘  └────────┘
```

### Infrastructure Details

**Hosting**: Azure Container Apps (Canada Central)
**Database**: Supabase (PostgreSQL 15, Canada region)
**Cache**: Azure Redis Cache (Basic tier, 1 GB)
**CDN**: Azure CDN (static assets)
**Monitoring**: Azure Monitor + Application Insights

## Deployment Procedures

### Standard Deployment

**Trigger**: Merge to `main` branch

**Automated CI/CD** (GitHub Actions):

```yaml
# .github/workflows/deploy-production.yml

1. Run tests (unit, integration)
2. Build Docker image
3. Push to Azure Container Registry
4. Deploy to Azure Container Apps (blue-green)
5. Run smoke tests
6. Switch traffic to new revision
7. Monitor for 15 minutes
8. Rollback if errors >1%
```

**Manual Deployment** (if CI/CD fails):

```bash
# 1. Build image
docker build -t abr-insights-app:v1.2.3 .

# 2. Tag for registry
docker tag abr-insights-app:v1.2.3 abrinightsacr.azurecr.io/app:v1.2.3

# 3. Push to registry
az acr login --name abrinightsacr
docker push abrinightsacr.azurecr.io/app:v1.2.3

# 4. Deploy to Container Apps
az containerapp update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --image abrinightsacr.azurecr.io/app:v1.2.3

# 5. Monitor logs
az containerapp logs show --name abr-insights-app --follow
```

### Rollback Procedure

**Scenario**: New deployment causes errors

**Quick Rollback** (automated):

```bash
# Revert to previous revision
az containerapp revision copy \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --from-revision abr-insights-app--v1.2.2

# Activate previous revision
az containerapp revision activate \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --revision abr-insights-app--v1.2.2
```

**Manual Rollback** (if automated fails):

1. Identify last known good commit: `git log --oneline`
2. Checkout: `git checkout abc123def`
3. Force deploy: `git push origin HEAD:main --force`
4. Wait for CI/CD to redeploy

**Database Rollback** (if schema change):

```bash
# Supabase migration rollback
supabase db reset --db-url $DATABASE_URL

# Or manual SQL
psql $DATABASE_URL -c "DROP TABLE new_table;"
```

### Hotfix Deployment

**Scenario**: Critical bug in production (P0/P1)

**Fast-Track Process**:

1. Create hotfix branch: `git checkout -b hotfix/urgent-fix`
2. Fix bug, commit: `git commit -m "hotfix: fix critical bug"`
3. Push: `git push origin hotfix/urgent-fix`
4. Create PR (skip normal review process if P0)
5. Merge to `main` (CI/CD deploys automatically)
6. Monitor for 30 minutes
7. Backport to `develop` branch

**Skip CI Checks** (emergency only):

```bash
# Bypass CI checks (use with caution)
git push origin main --no-verify

# Or merge PR with admin override
gh pr merge --admin --squash
```

## Monitoring & Alerts

### Health Checks

**Endpoints**:

- `/api/health`: Liveness (app running)
- `/api/health/ready`: Readiness (dependencies up)

**Expected Responses**:

```json
// GET /api/health
{ "status": "ok", "timestamp": "2026-02-03T10:30:45Z" }

// GET /api/health/ready
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "stripe": "ok"
  }
}
```

**Alert Rules** (Azure Monitor):

```
Health check failed (3 consecutive failures):
  → PagerDuty alert (P1)

Health check latency >5 seconds:
  → Slack notification

Container restart loop (>3 restarts in 5 minutes):
  → PagerDuty alert (P0)
```

### Key Metrics

**Application**:

- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Active users (concurrent)

**Infrastructure**:

- CPU usage (%)
- Memory usage (%)
- Disk I/O (MB/s)
- Network traffic (MB/s)

**Business**:

- New signups (/hour)
- Course enrollments (/hour)
- AI messages (/hour)
- Stripe payments (/hour)

**Dashboard**: https://portal.azure.com → Application Insights

### Log Aggregation

**Source**: Structured logs (production-logger)

**Storage**: Azure Log Analytics Workspace

**Retention**: 90 days

**Query Examples**:

**Find errors in last hour**:

```kusto
traces
| where timestamp > ago(1h)
| where severityLevel >= 3 // ERROR level
| project timestamp, message, customDimensions
| order by timestamp desc
```

**Trace request by correlation ID**:

```kusto
traces
| where customDimensions.correlationId == "req_abc123"
| project timestamp, message, severityLevel
| order by timestamp asc
```

**Count errors by type**:

```kusto
traces
| where severityLevel >= 3
| summarize count() by tostring(customDimensions.error)
| order by count_ desc
```

## Kill Switches

### 1. CanLII Ingestion Kill Switch

**Purpose**: Emergency stop for CanLII API ingestion

**Activation**:

```bash
# Set environment variable
az containerapp update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --set-env-vars CANLII_INGESTION_ENABLED=false

# Restart (apply immediately)
az containerapp revision restart \
  --name abr-insights-app \
  --resource-group abr-insights-rg
```

**Verification**:

```bash
# Check logs for kill switch message
az containerapp logs show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  | grep "ingestion disabled by kill switch"
```

**Reactivation**:

```bash
az containerapp update \
  --name abr-insights-app \
  --set-env-vars CANLII_INGESTION_ENABLED=true

az containerapp revision restart --name abr-insights-app
```

### 2. AI Features Kill Switch

**Purpose**: Stop AI costs during runaway usage

**Activation** (via admin dashboard):

1. Navigate to `/admin/ai-quotas`
2. Set all org quotas to 0:
   ```sql
   UPDATE ai_quota_overrides
   SET monthly_limit = 0
   WHERE organization_id IS NOT NULL;
   ```
3. Or disable AI globally:
   ```bash
   az containerapp update \
     --name abr-insights-app \
     --set-env-vars AI_FEATURES_ENABLED=false
   ```

**Reactivation**:

1. Restore quotas to normal values
2. Or re-enable: `AI_FEATURES_ENABLED=true`

### 3. CSP Report-Only Mode

**Purpose**: Investigate CSP violations without blocking

**Activation**:

```typescript
// middleware.ts (requires code deployment)
const cspHeader = `
  Content-Security-Policy-Report-Only: ...
` // Change from Content-Security-Policy
```

**Reactivation**: Revert code change, redeploy

### 4. Maintenance Mode

**Purpose**: Block all traffic during emergency maintenance

**Activation**:

```bash
# Enable maintenance mode
az containerapp ingress update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --target-port 8080 \
  --exposed-port 80 \
  --transport http \
  --allow-insecure false

# Or use middleware flag
az containerapp update \
  --name abr-insights-app \
  --set-env-vars MAINTENANCE_MODE=true
```

**User Experience**: All requests return 503 with message "Site under maintenance, back soon"

**Reactivation**: Set `MAINTENANCE_MODE=false`, restart

## Troubleshooting

### Scenario 1: Database Connection Failures

**Symptoms**:

- `/api/health/ready` returns `database: error`
- Logs: "ECONNREFUSED" or "ETIMEDOUT"
- User errors: "Failed to load data"

**Diagnosis**:

```bash
# Check database status (Supabase dashboard)
# Or test connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

**Resolution**:

1. **If Supabase outage**: Wait for resolution, enable maintenance mode
2. **If connection pool exhausted**:

   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;

   -- Kill idle connections
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';
   ```

3. **If network issue**: Check Azure VNet, restart container

### Scenario 2: Redis Connection Failures

**Symptoms**:

- `/api/health/ready` returns `redis: error`
- Rate limiting fails (CanLII, AI quotas)
- Logs: "Redis connection lost"

**Diagnosis**:

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
```

**Resolution**:

1. **If Azure Redis outage**: Rate limiters fail open (CanLII blocks, AI allows)
2. **If connection limit hit**: Restart container (clears connections)
3. **If authentication failed**: Verify `REDIS_URL` env var

### Scenario 3: High CPU Usage

**Symptoms**:

- Container CPU >80%
- Response times >5 seconds
- Timeout errors

**Diagnosis**:

```bash
# Check container metrics
az containerapp show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --query "properties.template.containers[0].resources"
```

**Resolution**:

1. **Scale up**: Increase CPU limit
   ```bash
   az containerapp update \
     --name abr-insights-app \
     --cpu 2.0 --memory 4.0Gi
   ```
2. **Scale out**: Increase replica count
   ```bash
   az containerapp update \
     --name abr-insights-app \
     --min-replicas 5 --max-replicas 10
   ```
3. **Investigate**: Check slow queries (pg_stat_statements)

### Scenario 4: Memory Leak

**Symptoms**:

- Container memory increasing over time
- OOM kills (Out of Memory)
- Container restarts

**Diagnosis**:

```bash
# Check memory usage
az containerapp logs show \
  --name abr-insights-app \
  | grep "Memory usage"
```

**Resolution**:

1. **Immediate**: Restart container (temporary fix)
2. **Short-term**: Increase memory limit
3. **Long-term**: Profile application, fix leak

   ```bash
   # Generate heap dump (Node.js)
   node --heapsnapshot-signal=SIGUSR2 index.js

   # Analyze with Chrome DevTools
   ```

### Scenario 5: CSP Violations Spike

**Symptoms**:

- > 100 CSP violations/hour
- `/api/csp-report` flooded
- Potential XSS attack

**Diagnosis**:

```bash
# Check violation sources
az monitor logs query \
  --workspace $LOG_ANALYTICS_WORKSPACE \
  --analytics-query "traces | where message contains 'CSP violation' | summarize count() by tostring(customDimensions.blockedUri)"
```

**Resolution**:

1. **If legitimate**: Update CSP policy (new CDN, script)
2. **If attack**: Block source IPs
   ```bash
   az containerapp ingress access-restriction add \
     --name abr-insights-app \
     --rule-name block-attacker \
     --ip-address 1.2.3.4/32 \
     --action Deny
   ```
3. **If unsure**: Enable CSP report-only mode (investigate)

## Backup & Restore

### Database Backups

**Automated Backups** (Supabase):

- Frequency: Daily at 2 AM UTC
- Retention: 7 days (free tier), 30 days (paid)
- Location: Supabase-managed (S3)

**Manual Backup**:

```bash
# Full database dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to Azure Blob Storage
az storage blob upload \
  --account-name abrinightsbackup \
  --container-name db-backups \
  --name backup-$(date +%Y%m%d).sql \
  --file backup-$(date +%Y%m%d).sql
```

**Point-in-Time Recovery**:

```bash
# Restore to specific timestamp (Supabase Pro only)
supabase db restore --db-url $DATABASE_URL --timestamp "2026-02-03 10:30:00"
```

### Redis Backups

**Automated Snapshots** (Azure Redis):

- Frequency: Daily
- Retention: 7 days
- Format: RDB (Redis Database Backup)

**Manual Backup**:

```bash
# Trigger snapshot
az redis force-reboot \
  --name abr-insights-redis \
  --resource-group abr-insights-rg \
  --reboot-type PrimaryNode
```

**Restore**:

```bash
# Via Azure Portal → Redis → Export/Import
# Or restore from RDB file
redis-cli -u $REDIS_URL --rdb backup.rdb
```

### File Storage Backups

**User Uploads** (Azure Blob Storage):

- Automatic replication (LRS - Locally Redundant Storage)
- Soft delete: 14 days
- Versioning: Enabled

**Manual Backup**:

```bash
# Copy container to backup
az storage blob copy start-batch \
  --source-container uploads \
  --destination-container uploads-backup-$(date +%Y%m%d)
```

## Disaster Recovery

### Scenario: Database Corruption

**Impact**: All data lost/corrupted

**Recovery Plan**:

1. **Immediate**: Enable maintenance mode (block writes)
2. **Assess**: Check backup integrity
   ```bash
   pg_restore --list backup-latest.sql
   ```
3. **Restore**: Latest backup
   ```bash
   psql $DATABASE_URL < backup-latest.sql
   ```
4. **Verify**: Run data integrity checks
   ```sql
   -- Check row counts
   SELECT 'profiles', COUNT(*) FROM profiles
   UNION ALL
   SELECT 'courses', COUNT(*) FROM courses;
   ```
5. **Reactivate**: Disable maintenance mode
6. **Communicate**: Email users (data loss notification)

**RPO** (Recovery Point Objective): 24 hours (daily backup)  
**RTO** (Recovery Time Objective): 2 hours (restore + verify)

### Scenario: Complete Azure Region Outage

**Impact**: All services unavailable (Canada Central down)

**Recovery Plan**:

1. **Immediate**: Activate backup region (Canada East)
2. **DNS**: Switch to backup endpoint
   ```bash
   az network dns record-set a update \
     --name @ \
     --zone-name abr-insights.com \
     --resource-group abr-insights-rg \
     --set aRecords[0].ipv4Address=<backup-ip>
   ```
3. **Database**: Restore from backup to new Supabase project (Canada East)
4. **Redeploy**: Deploy containers to Canada East
5. **Verify**: Health checks pass
6. **Communicate**: Status page update, email users

**RPO**: 24 hours  
**RTO**: 4 hours (region switch + redeployment)

### Scenario: Security Breach (Data Exfiltration)

**Impact**: Customer data potentially exposed

**Response Plan**: See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)

**Recovery Steps**:

1. **Isolate**: Kill switches, block attacker IPs
2. **Investigate**: Audit logs, identify compromised data
3. **Remediate**: Patch vulnerability, rotate secrets
4. **Notify**: Customers (GDPR 72-hour deadline)
5. **Monitor**: Increased logging, watch for recurrence

## Related Documents

- [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md): Security architecture
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md): Incident procedures
- [DATA_RETENTION.md](./DATA_RETENTION.md): Data policies

---

**Document History**:

- v1.0 (2026-02-03): Initial version (PR-08 compliance pack)
