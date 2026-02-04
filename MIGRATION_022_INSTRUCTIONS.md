# Individual User Support - Migration Instructions

## ✅ Code Changes Deployed (Commit 56c860a)

All application code has been updated and deployed to support individual users:
- Database migration created: `022_support_individual_users.sql`
- API guards updated to support optional organization context
- AI services updated to handle null organization_id
- Permission checks updated for individual users

## 🔧 Database Migration Required

The database schema needs to be updated to make `organization_id` nullable in three tables.

### Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of: `supabase/migrations/022_support_individual_users.sql`
5. Click **Run** to execute the migration

### Option 2: Apply via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Apply Manually via psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration file
\i supabase/migrations/022_support_individual_users.sql
```

## 📋 Migration Summary

The migration will:

1. **Make organization_id nullable** in:
   - `enrollments` table
   - `user_achievements` table
   - `ai_usage_logs` table

2. **Update RLS policies** to allow:
   - Individual users to view/insert/update their own records
   - Organization users to continue with existing org-scoped access

3. **Create helper functions**:
   - `auth.is_individual_user(user_id)` - Check if user has no organization
   - `auth.user_org_or_null()` - Get org ID or null for individuals
   - Update `auth.user_organization_id()` to return null instead of failing

4. **Add indexes** for individual user queries

## ✅ Verification Steps

After applying the migration, verify it worked:

### 1. Check Column Nullability

```sql
SELECT 
  table_name, 
  column_name, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'organization_id'
  AND table_name IN ('enrollments', 'user_achievements', 'ai_usage_logs');
```

Expected result: `is_nullable = 'YES'` for all three tables

### 2. Test Individual User Enrollment

```sql
-- Test inserting enrollment with null organization_id
INSERT INTO enrollments (
  user_id, 
  course_id, 
  organization_id, 
  status
) VALUES (
  '[USER_ID]',
  '[COURSE_ID]',
  NULL,  -- This should now work
  'active'
);
```

### 3. Check RLS Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('enrollments', 'user_achievements', 'ai_usage_logs')
ORDER BY tablename, policyname;
```

## 🎯 What This Enables

### For Individual Users (No Organization):
✅ Can sign up and create account  
✅ Can browse and view courses  
✅ Can enroll in courses  
✅ Can track progress and completions  
✅ Can earn achievements  
✅ Can use AI chat and coaching features  
✅ Can access course player and content  

### For Organization Users (Unchanged):
✅ All existing functionality preserved  
✅ RBAC permissions enforced as before  
✅ Organization-scoped quotas and limits  
✅ Team features and collaboration  

## 🔍 Troubleshooting

### Issue: Migration Fails with "already exists" errors
**Solution**: Some policies may already exist. You can safely ignore these warnings or drop the existing policies first.

### Issue: Foreign key constraint errors
**Solution**: Ensure the migration is applied in the correct order. The organizations table must exist before running this migration.

### Issue: Users still can't enroll without org
**Solution**: 
1. Verify the migration completed (check column nullability)
2. Hard refresh the application (Ctrl+Shift+R)
3. Check browser console for any API errors

## 📝 Rollback (If Needed)

If you need to rollback this change:

```sql
-- WARNING: This will fail if any NULL values exist
-- You must first delete or update records with NULL organization_id

-- Rollback enrollments
ALTER TABLE enrollments 
ALTER COLUMN organization_id SET NOT NULL;

-- Rollback user_achievements
ALTER TABLE user_achievements 
ALTER COLUMN organization_id SET NOT NULL;

-- Rollback ai_usage_logs
ALTER TABLE ai_usage_logs 
ALTER COLUMN organization_id SET NOT NULL;
```

## 🚀 Next Steps

1. **Apply the migration** using one of the options above
2. **Verify** the changes using the verification steps
3. **Test** individual user enrollment:
   - Sign up as a new user without an organization
   - Browse courses
   - Click "Start Course"
   - Verify enrollment succeeds
   - Access the course player
4. **Monitor** for any errors in production logs

## 📞 Support

If you encounter issues:
1. Check the verification steps above
2. Review the migration file for any syntax errors
3. Check Supabase dashboard for database errors
4. Review application logs in Azure Static Web Apps

---

**Migration Created**: February 4, 2026  
**Commit**: 56c860a  
**Deployment Status**: ⏳ Waiting for database migration to be applied
