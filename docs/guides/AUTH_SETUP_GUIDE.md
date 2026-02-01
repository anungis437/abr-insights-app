# 🔐 Authentication Setup - Fix 401 Error

## Issue

Login failing with 401 error: "Failed to load resource: the server responded with a status of 401"

**Root Cause**: No users exist in `auth.users` table (confirmed: 0 users found)

## Solution: Create Test Users via Supabase Dashboard

### Step 1: Verify/Update API Keys

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz

2. Click **Settings** → **API** in left sidebar

3. Copy the correct keys:
   - **Project URL**: Should be `***REMOVED***`
   - **anon public key**: JWT token starting with `eyJ...`
   - **.\* secret**: JWT token starting with `eyJ...`

4. Update `.env.local` if keys are different:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=***REMOVED***
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your actual anon key)
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (your actual service role key)
   ```

### Step 2: Create Super Admin User

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/auth/users

2. Click **"Add User"** button (top right)

3. Fill in:
   - **Email**: `super_admin@abr-insights.com`
   - **Password**: `TestPass123!`
   - **Auto Confirm User**: ✅ **YES** (important!)
4. Click **"Create User"**

**Option B: Via Supabase CLI**

```bash
# If you have Supabase CLI linked
npx supabase auth users create super_admin@abr-insights.com --password TestPass123!
```

### Step 3: Create Profile Record

After creating the user, we need to create a matching profile:

```bash
# Run this script after creating the auth user
npx tsx --env-file=.env.local scripts/create-profile-for-user.ts super_admin@abr-insights.com super_admin
```

Or manually via SQL Editor (https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql/new):

```sql
-- Get the user ID from auth.users
SELECT id FROM auth.users WHERE email = 'super_admin@abr-insights.com';

-- Insert profile (replace USER_ID_HERE with the ID from above)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'USER_ID_HERE',
  'super_admin@abr-insights.com',
  'Super Admin',
  'super_admin'
);
```

### Step 4: Restart Dev Server

```powershell
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 5: Test Login

1. Open: http://localhost:3001/auth/login
2. Login with:
   - Email: `super_admin@abr-insights.com`
   - Password: `TestPass123!`
3. Should redirect to dashboard

## Quick Fix Script

If Step 2 works but you still get 401, the keys might be wrong. Here's how to verify:

```bash
# Test the anon key
npx tsx scripts/test-supabase-keys.ts
```

## Create Additional Test Users (After First User Works)

Once you have one working user, create others via Dashboard:

| Email                       | Role               | Password     |
| --------------------------- | ------------------ | ------------ |
| learner@abr-insights.com    | learner            | TestPass123! |
| educator@abr-insights.com   | educator           | TestPass123! |
| analyst@abr-insights.com    | analyst            | TestPass123! |
| compliance@abr-insights.com | compliance_officer | TestPass123! |

**Important**: Always enable **"Auto Confirm User"** when creating test users!

## Troubleshooting

### Still Getting 401?

**Check 1: Verify Keys Are Loaded**

```powershell
# Check if env vars are loaded
node -e "require('dotenv').config({path:'.env.local'}); console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); console.log('Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)"
```

**Check 2: Test API Connection**

```bash
curl -X POST ***REMOVED***/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"super_admin@abr-insights.com","password":"TestPass123!"}'
```

If this returns 401, the key is definitely wrong.

**Check 3: Verify User Exists**

```sql
-- Via SQL Editor
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'super_admin@abr-insights.com';
```

Should return 1 row with `email_confirmed_at` set (not NULL).

## Expected Result

After setup:

- ✅ User exists in `auth.users` with `email_confirmed_at` set
- ✅ Profile exists in `public.profiles` with matching ID
- ✅ Login works and redirects to dashboard
- ✅ User can access protected routes

## Notes

- **Why no users initially?**: The migration script tried to insert into `auth.users` via SQL, but Supabase managed auth doesn't allow direct SQL inserts
- **Why Dashboard method?**: Supabase Auth API requires valid API keys (which we're troubleshooting)
- **Auto Confirm**: Must be enabled for test users, otherwise they need email verification

---

**Next Step**: Go to Supabase Dashboard and create the super_admin user, then test login!
