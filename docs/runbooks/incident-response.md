# Incident Response Runbook

## Overview

This runbook provides step-by-step procedures for responding to production incidents in the ABR Insights application. Follow these procedures to quickly identify, diagnose, and resolve issues while maintaining system security and data integrity.

## Incident Severity Levels

| Level             | Description             | Response Time     | Examples                                           |
| ----------------- | ----------------------- | ----------------- | -------------------------------------------------- |
| **P0 - Critical** | Complete service outage | 15 minutes        | Site down, database offline, authentication broken |
| **P1 - High**     | Major feature degraded  | 1 hour            | Payment processing issues, AI features failing     |
| **P2 - Medium**   | Minor feature degraded  | 4 hours           | Slow response times, non-critical feature down     |
| **P3 - Low**      | Cosmetic or minor issue | Next business day | UI glitch, typo, minor styling issue               |

## Quick Reference

### Essential Links

- **Application URL**: https://your-app.azurewebsites.net
- **Azure Portal**: https://portal.azure.com
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Application Insights**: Azure Portal → Application Insights
- **Log Analytics**: Azure Portal → Log Analytics Workspace

### Essential Commands

```bash
# Check health status
curl https://your-app.azurewebsites.net/api/healthz
curl https://your-app.azurewebsites.net/api/readyz

# View container logs (Azure)
az containerapp logs show --name <app-name> --resource-group <rg-name>

# Check recent deployments
az containerapp revision list --name <app-name> --resource-group <rg-name>

# Rollback to previous revision
az containerapp revision activate --name <app-name> --resource-group <rg-name> --revision <revision-name>
```

## Incident Response Workflow

### 1. Detect and Assess (0-5 minutes)

**Initial Steps:**

1. **Verify the incident**
   - Check monitoring dashboards (Azure Application Insights)
   - Verify user reports or alerts
   - Check `/api/healthz` and `/api/readyz` endpoints

2. **Determine severity**
   - How many users are affected?
   - What functionality is impacted?
   - Is data at risk?
   - Assign severity level (P0-P3)

3. **Capture correlation ID**
   - Get correlation ID from error reports or logs
   - Note: All responses include `x-correlation-id` header
   - Example: `550e8400-e29b-41d4-a716-446655440000`

4. **Create incident ticket**
   - Open incident in tracking system
   - Include: severity, symptoms, correlation ID, time detected

### 2. Communicate (5-10 minutes)

**Notify stakeholders:**

- **P0/P1**: Immediately notify on-call engineer + manager
- **P2**: Notify team channel
- **P3**: Create ticket for triage

**Status page update** (for P0/P1):

- Update status page with known issue
- Provide estimated resolution time
- Update every 30 minutes

### 3. Investigate (10-30 minutes)

**Use correlation ID to trace requests:**

```bash
# Search logs by correlation ID (Azure Log Analytics)
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "traces | where customDimensions.correlationId == '<correlation-id>' | project timestamp, message, severityLevel"
```

**Check common issues:**

#### Application Not Responding

```bash
# Check if app is running
curl -I https://your-app.azurewebsites.net/api/healthz

# Check container status
az containerapp show --name <app-name> --resource-group <rg-name> --query "properties.runningStatus"

# View recent errors
az containerapp logs show --name <app-name> --resource-group <rg-name> --tail 100
```

#### Database Connectivity Issues

```bash
# Check readyz endpoint (includes DB check)
curl https://your-app.azurewebsites.net/api/readyz | jq '.checks[] | select(.name == "database")'

# Check Supabase status
curl https://status.supabase.com/api/v2/status.json
```

#### Authentication Failures

**Look for:**

- Expired JWT secrets
- Supabase service disruption
- Cookie/session issues

```bash
# Check auth logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "traces | where message contains 'auth' or message contains 'unauthorized' | top 50 by timestamp desc"
```

#### Rate Limiting Issues

```bash
# Check for rate limit errors
curl https://your-app.azurewebsites.net/api/test-endpoint -I

# Look for 429 status codes in logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "requests | where resultCode == 429 | summarize count() by bin(timestamp, 5m)"
```

### 4. Mitigate (Varies by issue)

#### Quick Mitigations

**Restart application:**

```bash
# Restart container app
az containerapp revision restart --name <app-name> --resource-group <rg-name>
```

**Rollback deployment:**

```bash
# List recent revisions
az containerapp revision list --name <app-name> --resource-group <rg-name>

# Activate previous revision
az containerapp revision activate --name <app-name> --resource-group <rg-name> --revision <revision-name>
```

**Scale up resources:**

```bash
# Increase replica count
az containerapp update --name <app-name> --resource-group <rg-name> --min-replicas 3 --max-replicas 10
```

**Enable maintenance mode:**

- Update DNS or load balancer to show maintenance page
- Or set environment variable `MAINTENANCE_MODE=true` and restart

#### Database Issues

1. Check Supabase dashboard for incidents
2. Review connection pool settings
3. Check for long-running queries
4. Consider read replica for queries if available

#### Memory/Performance Issues

```bash
# Check memory usage
az containerapp show --name <app-name> --resource-group <rg-name> --query "properties.template.containers[0].resources"

# Increase memory limits
az containerapp update --name <app-name> --resource-group <rg-name> --memory 2Gi --cpu 1.0
```

### 5. Resolve (Varies)

**Permanent fixes:**

1. Deploy hotfix if needed
2. Run through deployment pipeline
3. Verify fix in staging first
4. Deploy to production
5. Monitor for 30 minutes post-deployment

### 6. Document and Learn (Post-incident)

**Within 24 hours:**

1. Write incident postmortem
   - What happened?
   - Root cause
   - Timeline
   - What went well?
   - What could be improved?
   - Action items

2. Update runbook with learnings
3. Create preventive measures (monitoring, alerts, tests)

## Common Scenarios

### Scenario 1: Site Is Down (P0)

```bash
# 1. Check if app is running
curl https://your-app.azurewebsites.net/api/healthz

# 2. Check container status
az containerapp show --name <app-name> --resource-group <rg-name>

# 3. View logs
az containerapp logs show --name <app-name> --resource-group <rg-name> --tail 200

# 4. If crashed, check last deployment
az containerapp revision list --name <app-name> --resource-group <rg-name>

# 5. Rollback if needed
az containerapp revision activate --name <app-name> --resource-group <rg-name> --revision <last-good-revision>
```

### Scenario 2: Slow Response Times (P1)

```bash
# 1. Check readyz for dependency issues
curl https://your-app.azurewebsites.net/api/readyz | jq '.'

# 2. Check Application Insights for slow requests
# Go to Azure Portal → Application Insights → Performance

# 3. Look for database slow queries
# Check Supabase dashboard → Database → Query performance

# 4. Check if rate limiting is affecting performance
# Look for 429 responses in logs

# 5. Consider scaling up
az containerapp update --name <app-name> --resource-group <rg-name> --min-replicas 3
```

### Scenario 3: Authentication Failures (P0)

```bash
# 1. Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# 2. Verify environment variables
az containerapp show --name <app-name> --resource-group <rg-name> --query "properties.configuration.secrets"

# 3. Check auth logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "traces | where customDimensions.event_type == 'AUTH_LOGIN_FAILURE' | top 50 by timestamp desc"

# 4. Test auth manually
curl -X POST https://your-app.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Scenario 4: Database Connection Failures (P0)

```bash
# 1. Check readyz endpoint
curl https://your-app.azurewebsites.net/api/readyz | jq '.checks[] | select(.name == "database")'

# 2. Verify Supabase is up
curl https://<your-project>.supabase.co/rest/v1/

# 3. Check connection string
# Verify SUPABASE_URL and keys are correct

# 4. Check connection pool
# Look for "too many connections" errors in logs

# 5. Restart app to reset connections
az containerapp revision restart --name <app-name> --resource-group <rg-name>
```

## Monitoring and Alerts

### Key Metrics to Watch

| Metric              | Normal         | Warning    | Critical                    |
| ------------------- | -------------- | ---------- | --------------------------- |
| Response time (p95) | < 500ms        | 500-2000ms | > 2000ms                    |
| Error rate          | < 0.1%         | 0.1-1%     | > 1%                        |
| CPU usage           | < 70%          | 70-85%     | > 85%                       |
| Memory usage        | < 75%          | 75-90%     | > 90%                       |
| Request rate        | Normal pattern | 2x normal  | 5x normal (possible attack) |

### Setting Up Alerts

1. **Azure Application Insights alerts**
   - Failed requests > 10 in 5 minutes
   - Response time p95 > 2000ms for 5 minutes
   - Exception rate > 5 in 1 minute

2. **Health endpoint monitoring**
   - `/api/healthz` returns non-200
   - `/api/readyz` returns 503 for > 2 minutes

3. **Database alerts**
   - Connection failures
   - Slow query alerts (> 1 second)

## Escalation Path

1. **On-call engineer** (first responder)
2. **Engineering lead** (if unresolved after 30 minutes)
3. **CTO/VP Engineering** (P0 incidents)
4. **External vendor support** (Supabase, Azure support)

## Contact Information

| Role             | Contact             | Availability        |
| ---------------- | ------------------- | ------------------- |
| On-call Engineer | [Rotation schedule] | 24/7                |
| Engineering Lead | [Contact info]      | 24/7 for P0         |
| Database Admin   | [Contact info]      | 24/7 for P0         |
| Azure Support    | Azure Portal        | 24/7 (Premium plan) |
| Supabase Support | support@supabase.io | 24/7 (Pro plan)     |

## Post-Incident Checklist

- [ ] Incident resolved and verified
- [ ] Status page updated
- [ ] Stakeholders notified
- [ ] Incident ticket updated with resolution
- [ ] Postmortem scheduled (P0/P1 only)
- [ ] Monitoring/alerting gaps identified
- [ ] Preventive measures documented
- [ ] Runbook updated with learnings

## Related Documents

- [Key Rotation Runbook](./key-rotation.md)
- [CSP Break-Glass Procedures](./csp-breakglass.md)
- [Release Acceptance Guide](../release-acceptance.md)
- [Production Readiness Checklist](../production-readiness/)
