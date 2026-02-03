# Update Test Environment Keys

## Issue

The anon key in `.env.test` is invalid for the Supabase project.

## Solution

You need to get the correct anon key from your Supabase project dashboard:

1. Go to https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/settings/api
2. Copy the "anon" / "public" key from the "Project API keys" section
3. Update `.env.test` with the new key:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-the-correct-key-here>
```

## Verification

After updating, test that the key works:

```bash
node -e "const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); client.from('profiles').select('id').limit(1).then(r => console.log('Success:', r.data)).catch(e => console.error('Error:', e));"
```

If you see "Success:" then the key is correct and tests should work.
