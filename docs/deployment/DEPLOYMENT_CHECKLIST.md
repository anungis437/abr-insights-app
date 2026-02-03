# CanLII REST API Deployment Checklist

## Pre-Deployment Phase

### Environment Setup (15 minutes)

- [ ] Request CanLII API key from <https://www.canlii.org/en/info/feedback>
- [ ] Receive API key confirmation email
- [ ] Verify key format (alphanumeric string, typically 32+ characters)
- [ ] Add key to `.env.local` for local testing
- [ ] Add key to CI/CD secrets (GitHub Actions, Azure DevOps, etc.)
- [ ] Document API key rotation schedule (annually)

### Code Review (30 minutes)

- [ ] All new code reviewed and approved
  - [ ] `ingestion/src/clients/canlii-api.ts` (300 lines)
  - [ ] `ingestion/src/clients/canlii-database-mapper.ts` (250 lines)
  - [ ] `ingestion/src/scrapers/canlii-rest-api.ts` (250 lines)
  - [ ] `ingestion/src/scrapers/factory.ts` (180 lines)
  - [ ] `ingestion/src/validation/canlii-validation.ts` (380 lines)
  - [ ] `ingestion/src/utils/logger.ts` (20 lines)
- [ ] No hardcoded secrets in code
- [ ] All error codes documented
- [ ] Rate limiting implemented correctly
- [ ] Logging statements follow conventions

### Testing (1 hour)

- [ ] Unit tests pass locally

  ```bash
  npm run test:unit tests/ingestion-*.spec.ts
  ```

- [ ] TypeScript compilation passes

  ```bash
  npm run type-check
  ```

- [ ] No ESLint errors

  ```bash
  npm run lint
  ```

- [ ] Live API tests pass with valid key

  ```bash
  CANLII_API_KEY=your-key npm run test:unit tests/ingestion-canlii-api.spec.ts
  ```

- [ ] Database discovery works

  ```bash
  CANLII_API_KEY=your-key node scripts/discover-canlii-databases.mjs
  ```

- [ ] Health check passes

  ```bash
  CANLII_API_KEY=your-key npm run ingest -- --health-check
  ```

### Configuration (30 minutes)

- [ ] Review `.env.example` updates
- [ ] Verify all required ENV variables documented
  - [ ] `CANLII_API_KEY`
  - [ ] `CANLII_API_ENABLED=true`
  - [ ] `CANLII_API_BASE_URL=https://api.canlii.org/v1`
  - [ ] `ENABLE_WEB_SCRAPER=true` (for fallback)
- [ ] Document database ID mappings
- [ ] Review backwards compatibility
  - [ ] Web scraper still functions
  - [ ] Legacy configurations still work
  - [ ] No breaking changes to existing APIs

### Documentation (30 minutes)

- [ ] Migration guide created: `docs/CANLII_API_MIGRATION.md`
- [ ] API examples documented: `docs/API_CLIENT_EXAMPLES.md`
- [ ] Database mappings created: `docs/CANLII_DATABASE_IDS.md`
- [ ] Troubleshooting guide completed
- [ ] README updated with REST API information
- [ ] Team notified of changes

---

## Staging Deployment (1-2 hours)

### Environment Setup

- [ ] Add `CANLII_API_KEY` to staging environment
- [ ] Set `CANLII_API_ENABLED=true` in staging
- [ ] Set other ENV variables in staging
- [ ] Verify environment configuration

  ```bash
  npm run ingest -- --validate-config
  ```

### Single Tribunal Test

- [ ] Select one tribunal for initial test (e.g., HRTO - `onhrt`)
- [ ] Configure source to use REST API mode

  ```typescript
  {
    apiMode: 'rest',
    databaseId: 'onhrt',
    enabled: true,
  }
  ```

- [ ] Run ingestion pipeline

  ```bash
  npm run ingest -- onhrt --source-type canlii
  ```

- [ ] Verify case discovery
  - [ ] Cases discovered successfully
  - [ ] Correct number of cases (compare with legacy scraper)
  - [ ] No errors in logs
  - [ ] API rate limiting working

### Data Validation

- [ ] Check database for new cases

  ```sql
  SELECT COUNT(*) FROM decisions WHERE source = 'canlii_api'
  ```

- [ ] Compare metadata with web scraper results
  - [ ] Titles match
  - [ ] Citations match
  - [ ] Dates match
  - [ ] Text content matches (if applicable)
- [ ] Verify case relationships
  - [ ] Citations are captured
  - [ ] Hierarchical relationships correct
  - [ ] No duplicate entries

### Performance Testing

- [ ] Measure ingestion time

  ```bash
  time npm run ingest -- onhrt --source-type canlii
  ```

- [ ] Monitor memory usage
  - [ ] Should not exceed 500MB
  - [ ] Should not have memory leaks (run multiple times)
- [ ] Verify API response times
  - [ ] Database discovery < 500ms
  - [ ] Case discovery < 250ms per page
  - [ ] Metadata retrieval < 200ms
- [ ] Check rate limiting
  - [ ] No 429 errors
  - [ ] Requests properly throttled

### Error Handling

- [ ] Test error scenarios
  - [ ] Network interruption (disconnect internet during ingestion)
  - [ ] Invalid database ID
  - [ ] Missing API key
  - [ ] Rate limit exceeded
- [ ] Verify automatic retries work
  - [ ] Check logs for retry messages
  - [ ] Verify exponential backoff
  - [ ] Verify final success after retries
- [ ] Check logging output
  - [ ] No sensitive information in logs
  - [ ] Clear error messages
  - [ ] Helpful debugging information

### Monitoring Setup

- [ ] Application Insights configured
  - [ ] API requests tracked
  - [ ] Error rates monitored
  - [ ] Performance metrics collected
  - [ ] Custom events for migration tracked
- [ ] Alerts configured
  - [ ] High error rate alert (>5%)
  - [ ] High latency alert (>1s)
  - [ ] Rate limit alert
  - [ ] Connection failure alert
- [ ] Dashboards created
  - [ ] API call metrics
  - [ ] Error rate by tribunal
  - [ ] Response time distribution
  - [ ] Case discovery progress

### Rollback Testing

- [ ] Verify rollback procedure works
  - [ ] Can switch back to web scraper
  - [ ] Web scraper still functions
  - [ ] No data loss on rollback
- [ ] Document rollback steps
- [ ] Test rollback procedure in staging

  ```typescript
  apiMode: 'scrape',  // Switch back
  listingUrl: 'https://www.canlii.org/en/on/onhr/'
  ```

---

## Production Deployment

### Pre-Production Checklist

- [ ] All staging tests passed
- [ ] Team approval obtained
- [ ] Stakeholders notified of deployment
- [ ] Change request submitted (if required)
- [ ] Deployment window scheduled
- [ ] Rollback plan documented
- [ ] Support team briefed on new system

### Phased Rollout (Per Tribunal)

For each tribunal, complete the following steps:

#### Tribunal: **\*\***\_**\*\*** (Database ID: **\_\_\_**)

**Step 1: Initial Deployment (30 min)**

- [ ] Deploy code to production
  - [ ] All new modules deployed
  - [ ] Configuration files updated
  - [ ] ENV variables set
- [ ] Verify deployment
  - [ ] TypeScript check passes
  - [ ] No ESLint errors
  - [ ] All modules load correctly
- [ ] Run health check

  ```bash
  npm run ingest -- --health-check
  ```

- [ ] Expected: ✅ All checks pass

**Step 2: Initial Data Sync (1-2 hours)**

- [ ] Run first ingestion

  ```bash
  npm run ingest -- {tribunal} --source-type canlii
  ```

- [ ] Monitor ingestion process
  - [ ] Check logs for errors
  - [ ] Verify case discovery
  - [ ] Monitor performance
- [ ] Verify data quality
  - [ ] Record initial case count
  - [ ] Spot check cases (sample 10-20)
  - [ ] Verify metadata completeness
  - [ ] Check for duplicates
- [ ] Expected: ✅ Cases ingested successfully

**Step 3: 24-Hour Monitoring (Daily for 7 days)**

- [ ] Check logs for errors
  - [ ] No unexpected failures
  - [ ] Rate limiting working
  - [ ] All retries successful
- [ ] Monitor metrics
  - [ ] Error rate < 1%
  - [ ] API latency normal
  - [ ] No memory leaks
- [ ] Run data quality checks
  - [ ] No missing cases
  - [ ] No duplicate cases
  - [ ] Metadata intact
- [ ] Expected: ✅ System stable

**Step 4: Disable Legacy Scraper (If Successful)**

- [ ] Verify REST API working well for 24+ hours
- [ ] Update configuration

  ```typescript
  apiMode: 'rest',  // Use REST API
  enabled: true,
  // Remove or disable:
  // apiMode: 'scrape',
  // listingUrl: ...,
  ```

- [ ] Deploy changes
- [ ] Verify no regression
- [ ] Expected: ✅ Using only REST API

**Step 5: Move to Next Tribunal**

- [ ] Mark tribunal as migrated
- [ ] Document any issues encountered
- [ ] Repeat for next tribunal

### Parallel Tribunal Schedule

| Tribunal | Database ID | Week | Status     |
| -------- | ----------- | ---- | ---------- |
| HRTO     | onhrt       | 1    | ⬜ Pending |
| CHRT     | chrt        | 1    | ⬜ Pending |
| BCHRT    | bchrt       | 2    | ⬜ Pending |
| ABHR     | ab          | 2    | ⬜ Pending |
| SKHR     | sk          | 3    | ⬜ Pending |
| MBHR     | mb          | 3    | ⬜ Pending |

### Production Monitoring (Ongoing)

**Daily Checks:**

- [ ] API error rate < 1%
- [ ] API response times normal
- [ ] No alerts triggered
- [ ] Database growth as expected

**Weekly Checks:**

- [ ] Performance metrics reviewed
- [ ] Error logs analyzed
- [ ] Data quality spot check
- [ ] User feedback reviewed

**Monthly Checks:**

- [ ] Full data integrity audit
- [ ] Performance trending analysis
- [ ] Cost analysis (API calls vs data value)
- [ ] Documentation updated

---

## Post-Deployment Phase

### Verification (1 hour)

- [ ] All tribunals migrated successfully
- [ ] Web scraper disabled (if not needed as fallback)
- [ ] No errors in production logs
- [ ] Metrics within expected ranges
- [ ] Users report no issues

### Cleanup

- [ ] Remove legacy scraper code (optional, keep as fallback)
- [ ] Archive old scraping scripts
- [ ] Remove deprecated configuration options
- [ ] Update CI/CD pipeline (remove scraper tests if not kept)

### Documentation

- [ ] Update README with REST API information
- [ ] Archive old scraping documentation
- [ ] Create final migration report
- [ ] Document lessons learned
- [ ] Update troubleshooting guide

### Communication

- [ ] Notify stakeholders of completion
- [ ] Thank team for migration effort
- [ ] Share migration report with stakeholders
- [ ] Plan celebration/recognition event

### Knowledge Transfer

- [ ] Train support team on new system
  - [ ] Health check procedure
  - [ ] Common errors and solutions
  - [ ] Escalation procedures
- [ ] Document on-call procedures
- [ ] Create runbook for new system
  - [ ] What to do if API is down
  - [ ] How to revert to web scraper
  - [ ] How to investigate errors

---

## Rollback Procedures

### Immediate Rollback (If Critical Issue)

1. **Stop Ingestion**

   ```bash
   kill $(pgrep -f "npm run ingest")
   ```

2. **Switch to Web Scraper**

   ```typescript
   // Update configuration
   apiMode: 'scrape',
   listingUrl: 'https://www.canlii.org/...',
   ```

3. **Restart Ingestion**

   ```bash
   npm run ingest -- {tribunal}
   ```

4. **Verify**

   ```bash
   npm run ingest -- --health-check
   ```

### Gradual Rollback (If Issues with Specific Tribunal)

1. **Identify Problematic Tribunal**
   - Check logs for errors
   - Verify data quality issues

2. **Revert Configuration**

   ```typescript
   apiMode: 'scrape',  // Switch to web scraper
   ```

3. **Re-run Ingestion**
   - Verify data quality
   - Check for errors

4. **Investigate Root Cause**
   - Review API responses
   - Check for data format changes
   - Contact CanLII support if needed

5. **Fix and Retry**
   - Apply fixes to code
   - Re-test in staging
   - Deploy to production
   - Verify success

### Complete Rollback (If Unfixable Issues)

1. **Disable REST API**

   ```
   CANLII_API_ENABLED=false
   ```

2. **Use Web Scraper for All Tribunals**

   ```typescript
   apiMode: 'scrape',  // All configurations
   ```

3. **Restart Ingestion**
   - Full re-sync from web
   - May take 4-8 hours

4. **Document Lessons**
   - What went wrong
   - How to prevent
   - When to try again

---

## Sign-Off

### Deployment Team

- [ ] Product Manager: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**
- [ ] Engineering Lead: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**
- [ ] QA Lead: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**
- [ ] DevOps Lead: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**
- [ ] Support Lead: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**

### Go-Live Approval

- [ ] All checklist items completed
- [ ] No critical issues identified
- [ ] Team ready for production
- [ ] Rollback plan in place
- [ ] Monitoring configured

**Ready for Go-Live**: ☐ YES ☐ NO

**Deployment Date**: **\*\***\_**\*\***  
**Deployment Time**: **\*\***\_**\*\***  
**Expected Duration**: 2-4 hours

---

## Post-Deployment Report

### Deployment Summary

- **Date**: **\*\***\_**\*\***
- **Duration**: **\*\***\_**\*\***
- **Status**: ✅ SUCCESS / ❌ FAILED / ⚠️ PARTIAL
- **Tribunals Migrated**: **\*\***\_**\*\***
- **Issues Encountered**: **\*\***\_**\*\***

### Metrics

- **Total Cases Discovered**: **\*\***\_**\*\***
- **Average Response Time**: **\*\***\_**\*\***
- **Error Rate**: **\*\***\_**\*\***
- **Success Rate**: **\*\***\_**\*\***

### Lessons Learned

1. ***
2. ***
3. ***

### Recommendations

1. ***
2. ***
3. ***

---

**Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Ready for Deployment
