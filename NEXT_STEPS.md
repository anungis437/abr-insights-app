# Next Steps - Complete Database Setup

## 🎯 Current Status

✅ **Completed:**
- Fixed Next.js build issues
- Converted to static export
- Deployed successfully to Azure Static Web Apps  
- Site is LIVE at: https://purple-ground-03d2b380f.3.azurestaticapps.net
- Ingestion pipeline is ready to populate data

⚠️ **Needs Completion:**
- Create `cases` table in Supabase
- Run ingestion to populate demo data
- Test the live site with real data

---

## 📋 Action Required: Create Cases Table

The web app queries the `cases` table, but Supabase currently only has `tribunal_cases_raw`.

### Step 1: Run SQL in Supabase

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/nuywgvbkgdvngrysqdul/sql/new)
2. Copy and paste the SQL below:

```sql
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL UNIQUE,
    source_system VARCHAR(100) NOT NULL,
    case_title TEXT,
    case_number VARCHAR(100),
    citation VARCHAR(500),
    tribunal_name VARCHAR(255),
    decision_date DATE,
    applicant TEXT,
    respondent TEXT,
    full_text TEXT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'decision',
    rule_based_classification JSONB DEFAULT '{}',
    ai_classification JSONB DEFAULT '{}',
    combined_confidence DECIMAL(5,2) DEFAULT 0,
    needs_review BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_source_url ON cases(source_url);
CREATE INDEX IF NOT EXISTS idx_cases_decision_date ON cases(decision_date DESC);
CREATE INDEX IF NOT EXISTS idx_cases_source_system ON cases(source_system);
CREATE INDEX IF NOT EXISTS idx_cases_needs_review ON cases(needs_review);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read access" ON cases;
CREATE POLICY "Allow anonymous read access" ON cases
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF NOT EXISTS "Allow authenticated read access" ON cases;
CREATE POLICY "Allow authenticated read access" ON cases
    FOR SELECT
    TO authenticated
    USING (true);
```

3. Click "Run" to execute

### Step 2: Populate with Demo Data

After creating the table, run:

```bash
npm run ingest -- --demo --limit 20
```

This will:
- Generate 20 realistic demo tribunal decisions
- Classify them (10 anti-Black racism, 10 other discrimination)
- Store them in BOTH `tribunal_cases_raw` AND `cases` tables

### Step 3: Test the Live Site

Visit these URLs to verify:

1. **Homepage**: https://purple-ground-03d2b380f.3.azurestaticapps.net
2. **Cases Browser**: https://purple-ground-03d2b380f.3.azurestaticapps.net/cases/browse
3. **Analytics**: https://purple-ground-03d2b380f.3.azurestaticapps.net/analytics

---

## 🔧 Technical Changes Made

### Files Modified:

1. **`ingestion/src/cli.ts`**
   - Fixed storage method call from `storage.storeDecision` to `storeCase`

2. **`ingestion/src/orchestrator/index.ts`**
   - Updated to insert into BOTH tables:
     - `tribunal_cases_raw` (full data)
     - `cases` (simplified for web app)
   - Handles cases table gracefully if it doesn't exist yet

3. **Created Helper Scripts:**
   - `test-supabase-connection.ts` - Test Supabase connectivity
   - `check-tables.ts` - Check which tables exist
   - `setup-cases-table.ts` - Generate SQL for cases table
   - `create_cases_table.sql` - SQL schema file

---

## 📊 Database Architecture

```
tribunal_cases_raw (ingestion/raw data)
    ↓ populated by ingestion pipeline
    ↓ includes full metadata, classification details
    
cases (web app/clean data)
    ↓ populated by ingestion pipeline
    ↓ simplified schema for public consumption
    ↓ queried by /cases/browse and /analytics
```

---

## 🚀 Deployment Pipeline

```
Local → GitHub Push → GitHub Actions → Azure Build & Deploy → LIVE
```

**Current Deployment:** All code is pushed and deployed
**Status:** ✅ Working (awaiting data population)

---

## ✅ Verification Checklist

After running the SQL and ingestion:

- [ ] `cases` table created in Supabase
- [ ] Run ingestion: `npm run ingest -- --demo --limit 20`
- [ ] Verify data in Supabase:
  ```bash
  npx tsx --env-file=.env.local test-supabase-connection.ts
  ```
- [ ] Test cases browser on live site
- [ ] Test analytics page on live site
- [ ] Verify filtering/sorting works
- [ ] Test case detail pages

---

## 🎓 Optional: Populate More Data

Once basic setup is working:

```bash
# Generate 50 cases
npm run ingest -- --demo --limit 50

# Generate 100 cases
npm run ingest -- --demo --limit 100

# Real data from CanLII (requires access)
npm run ingest -- --source canlii_hrto --limit 50
```

---

## 📞 Support Files

All necessary files have been created:
- `DEPLOYMENT_SUCCESS.md` - Deployment documentation
- `create_cases_table.sql` - Table schema
- `test-supabase-connection.ts` - Connection tester
- `check-tables.ts` - Table checker

---

## 🎯 Summary

**What's Done:**
✅ Production build fixed
✅ Azure deployment working
✅ Site is live
✅ Ingestion pipeline ready
✅ Code pushed to GitHub

**What's Next (5 minutes):**
1. Run SQL in Supabase (2 min)
2. Run ingestion command (1 min)
3. Test live site (2 min)

**Result:** Fully functional ABR Insights platform with demo data! 🎉

---

Last Updated: November 6, 2025
