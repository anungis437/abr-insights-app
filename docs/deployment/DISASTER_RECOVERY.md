# Disaster Recovery & Backup Documentation (P1)

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [RTO & RPO Targets](#rto--rpo-targets)
4. [Restore Procedures](#restore-procedures)
5. [Testing & Drills](#testing--drills)
6. [Runbook](#runbook)

---

## Overview

This document outlines the disaster recovery (DR) and backup strategy for ABR Insights. Our multi-tier backup approach ensures data durability and rapid recovery in case of failures.

**Last Updated:** 2024-01-15  
**Next DR Drill:** Schedule quarterly  
**Responsible Team:** DevOps + Engineering Leads

---

## Backup Strategy

### 1. Database (Supabase PostgreSQL)

**Automatic Backups:**

- **Daily Backups:** Supabase Pro automatically performs daily backups
- **Retention:** 7 days for Pro tier, 30 days for Enterprise tier
- **Point-in-Time Recovery (PITR):** Available for last 7 days (Pro) / 30 days (Enterprise)
- **Storage:** Backups stored in separate region for redundancy

**Manual Backups (Critical Operations):**

```bash
# Before major schema migrations or data migrations
pg_dump -h [SUPABASE_HOST] -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

**What's Backed Up:**

- ✅ User profiles, organizations, subscriptions
- ✅ Course progress, quiz attempts, certificates
- ✅ Tribunal cases, CE credits, achievements
- ✅ AI usage logs, coaching sessions
- ✅ RBAC roles, permissions, assignments

**Not Backed Up:**

- ⚠️ Evidence bundle files (see Storage section)
- ⚠️ Transient session data
- ⚠️ Rate limit counters (in-memory)

### 2. File Storage (Supabase Storage)

**Evidence Bundles & Uploaded Files:**

```bash
# Weekly backup script (run via GitHub Actions)
#!/bin/bash
# Location: scripts/backup-storage.sh

DATE=$(date +%Y%m%d)
BUCKET_NAME="evidence-bundles"

# 1. List all files in bucket
supabase storage list $BUCKET_NAME --recursive > /tmp/file_list.txt

# 2. Download all files
mkdir -p backups/$DATE/$BUCKET_NAME
while IFS= read -r file; do
  supabase storage download $BUCKET_NAME "$file" --output "backups/$DATE/$BUCKET_NAME/$file"
done < /tmp/file_list.txt

# 3. Compress
tar -czf backups/storage_$DATE.tar.gz backups/$DATE

# 4. Upload to Azure Blob Storage (offsite)
az storage blob upload \
  --account-name abrbackups \
  --container-name disaster-recovery \
  --file backups/storage_$DATE.tar.gz \
  --name storage_$DATE.tar.gz
```

**Automated Schedule:**

- **Weekly:** Full storage backup to Azure Blob Storage
- **Retention:** 30 days hot, 180 days cold storage
- **Offsite:** Azure Blob Storage (different cloud provider for redundancy)

### 3. Application Code & Configuration

**Version Control (GitHub):**

- ✅ All code versioned in GitHub
- ✅ Protected main branch (requires PR + approvals)
- ✅ Tag releases (e.g., `v1.2.0`)

**Environment Variables & Secrets:**

```bash
# Backup .env values (encrypted)
# Location: docs/deployment/secrets-backup.enc.txt

# Decrypt with GPG
gpg --decrypt secrets-backup.enc.txt

# Critical secrets to back up:
# - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# - AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY
# - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
# - CSRF_SECRET, NEXTAUTH_SECRET
```

**Infrastructure as Code:**

- ✅ Deployment scripts in `/scripts`
- ✅ Docker configs in `/Dockerfile`, `/docker-compose.yml`
- ✅ CI/CD workflows in `.github/workflows`

---

## RTO & RPO Targets

| Scenario                           | RTO (Recovery Time) | RPO (Data Loss)      | Impact               |
| ---------------------------------- | ------------------- | -------------------- | -------------------- |
| **Database corruption**            | 2 hours             | 1 day (last backup)  | HIGH                 |
| **Storage bucket deletion**        | 4 hours             | 1 week (last backup) | MEDIUM               |
| **Complete Supabase outage**       | 8 hours             | 1 day (last backup)  | CRITICAL             |
| **Application deployment failure** | 30 minutes          | 0 (rollback)         | LOW                  |
| **Azure OpenAI outage**            | N/A                 | N/A                  | MEDIUM (degraded AI) |

**Acceptable Data Loss:**

- **Critical Data:** ≤ 1 day (profiles, subscriptions, progress)
- **User-Generated Content:** ≤ 1 week (evidence bundles, uploads)
- **AI Logs:** ≤ 30 days (acceptable for analytics)

---

## Restore Procedures

### Scenario 1: Database Corruption or Accidental Deletion

**Symptoms:**

- Missing data in production
- Foreign key constraint errors
- Reports of lost user progress

**Steps:**

1. **Identify Issue Scope**

   ```sql
   -- Check if specific tables affected
   SELECT count(*) FROM profiles;  -- Expected: ~1000+
   SELECT count(*) FROM organizations;  -- Expected: ~50+
   ```

2. **Initiate Point-in-Time Recovery (PITR)**
   - Log into Supabase Dashboard → Settings → Database → Backups
   - Select restore point (within last 7 days)
   - Choose "Restore to new project" (safest)
   - Wait 10-20 minutes for restore completion

3. **Validate Restored Data**

   ```sql
   -- Verify record counts
   SELECT 'profiles' as table, count(*) FROM profiles
   UNION ALL
   SELECT 'organizations', count(*) FROM organizations
   UNION ALL
   SELECT 'course_progress', count(*) FROM course_progress;
   ```

4. **Update Connection Strings**
   - Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in environment
   - Redeploy application with new credentials

5. **Notify Users**
   - Post status update on status page
   - Email affected users if necessary

**Time to Recovery:** ~2 hours (including validation)

### Scenario 2: Storage Bucket Deletion

**Symptoms:**

- 404 errors for evidence bundle downloads
- Storage bucket not found errors

**Steps:**

1. **Recreate Bucket**

   ```bash
   supabase storage create-bucket evidence-bundles --public
   ```

2. **Restore from Azure Blob Backup**

   ```bash
   # Download latest backup
   LATEST_BACKUP=$(az storage blob list \
     --account-name abrbackups \
     --container-name disaster-recovery \
     --query "[?contains(name, 'storage_')].name" -o tsv | sort -r | head -1)

   az storage blob download \
     --account-name abrbackups \
     --container-name disaster-recovery \
     --name $LATEST_BACKUP \
     --file /tmp/storage_backup.tar.gz

   # Extract
   tar -xzf /tmp/storage_backup.tar.gz -C /tmp

   # Re-upload to Supabase
   cd /tmp/backups/[DATE]/evidence-bundles
   for file in **/*; do
     supabase storage upload evidence-bundles "$file" --file "$file"
   done
   ```

3. **Verify Upload**

   ```bash
   supabase storage list evidence-bundles --recursive | wc -l
   # Should match pre-incident count
   ```

**Time to Recovery:** ~4 hours (depends on data volume)

### Scenario 3: Complete Supabase Outage

**Symptoms:**

- All API requests failing
- Supabase status page shows outage
- Cannot reach Supabase Dashboard

**Steps:**

1. **Assess Outage Scope**
   - Check Supabase status: <https://status.supabase.com>
   - Estimate downtime duration

2. **If Outage > 4 hours: Migrate to Backup Instance**
   - Create new Supabase project
   - Restore from latest backup (see Database Restore above)
   - Run schema migrations
   - Update environment variables
   - Redeploy application

3. **If Outage < 4 hours: Wait and Monitor**
   - Display maintenance page
   - Post updates to status page
   - Monitor Supabase status

4. **Post-Recovery Actions**
   - Sync any pending webhooks (Stripe, email)
   - Verify data integrity
   - Run smoke tests

**Time to Recovery:** 8 hours (worst case, full migration)

---

## Testing & Drills

### Quarterly DR Drill Schedule

**Q1 (January):** Database Restore Test

- Restore last week's backup to staging
- Verify data integrity
- Time the process
- Document issues

**Q2 (April):** Storage Backup Restore Test

- Download Azure Blob backup
- Restore to test bucket
- Verify file integrity
- Update scripts

**Q3 (July):** Full Disaster Simulation

- Simulate complete Supabase outage
- Migrate to backup instance
- Test application functionality
- Measure RTO/RPO

**Q4 (October):** Secrets Recovery Test

- Decrypt secrets backup
- Verify all keys valid
- Update expired secrets
- Test application startup

### Test Checklist

- [ ] Database backup restores successfully
- [ ] Storage files accessible after restore
- [ ] Application starts with restored data
- [ ] User authentication works
- [ ] Stripe webhooks reconnect
- [ ] AI features functional
- [ ] Monitoring alerts resume

---

## Runbook

### Emergency Contacts

| Role                 | Contact | Phone           | Email                              |
| -------------------- | ------- | --------------- | ---------------------------------- |
| **On-Call Engineer** | TBD     | +1-XXX-XXX-XXXX | <oncall@abrinsights.com>             |
| **CTO**              | TBD     | +1-XXX-XXX-XXXX | <cto@abrinsights.com>                |
| **Supabase Support** | N/A     | N/A             | <support@supabase.com>               |
| **Azure Support**    | N/A     | N/A             | [Portal](https://portal.azure.com) |

### Escalation Path

1. **Level 1 (0-30 min):** On-call engineer investigates
2. **Level 2 (30-60 min):** Escalate to engineering lead
3. **Level 3 (60+ min):** Escalate to CTO, initiate DR procedures

### Communication Templates

**Incident Start (Status Page):**

```
We are currently investigating reports of [ISSUE].
Our team is actively working on a resolution.
Next update: [TIME]
```

**Incident Update:**

```
Update: We have identified the root cause as [CAUSE].
ETA to resolution: [TIME]
Impact: [DESCRIPTION]
```

**Incident Resolved:**

```
✅ Resolved: [ISSUE] has been resolved.
Duration: [HOURS]
Root cause: [BRIEF EXPLANATION]
Post-mortem: [LINK]
```

---

## Backup Verification Log

| Date       | Type          | Restore Test      | Data Integrity | Status        |
| ---------- | ------------- | ----------------- | -------------- | ------------- |
| 2024-01-15 | Database      | ✅ Pass           | ✅ Verified    | GOOD          |
| 2024-01-15 | Storage       | ❌ Fail (timeout) | ⚠️ Partial     | ACTION NEEDED |
| TBD        | Full DR Drill | -                 | -              | SCHEDULED Q1  |

---

## Next Steps

1. **Schedule Q1 DR Drill** (Target: End of January)
2. **Set up Azure Blob Storage account** for offsite backups
3. **Automate storage backup script** via GitHub Actions
4. **Create encrypted secrets backup**
5. **Document Stripe webhook recovery** procedure
6. **Set up monitoring for backup job failures**

---

## Additional Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [Azure Blob Storage CLI](https://learn.microsoft.com/en-us/cli/azure/storage/blob)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [GDPR Data Protection Guidelines](https://gdpr.eu/)

---

**Document Owner:** DevOps Team  
**Review Cadence:** Quarterly  
**Last Drill:** TBD (Schedule first drill)  
**Next Review:** April 2024
