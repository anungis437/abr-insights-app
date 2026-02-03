import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function cleanDatabase() {
  console.log('🧹 Cleaning auth tables...\n')

  // Direct SQL to clean up corrupted data
  const cleanupQueries = [
    'DELETE FROM auth.identities;',
    'DELETE FROM auth.refresh_tokens;',
    'DELETE FROM auth.sessions;',
    'DELETE FROM auth.users;',
    'DELETE FROM public.profiles;',
  ]

  for (const query of cleanupQueries) {
    console.log(`Executing: ${query}`)
    const { error } = await supabase.rpc('exec_sql', { sql: query })
    if (error) {
      // Try direct query if RPC doesn't exist
      const { error: directError } = await supabase.from('_sql').select(query)
      if (directError) {
        console.log(`⚠️  Could not execute: ${error.message}`)
      }
    } else {
      console.log('✅ Cleaned')
    }
  }

  console.log('\n✨ Database cleaned. Now creating fresh users...\n')

  const testUsers = [
    {
      email: 'super_admin@abr-insights.com',
      password: 'TestPass123!',
      role: 'super_admin',
      display_name: 'Super Administrator',
    },
    {
      email: 'educator@abr-insights.com',
      password: 'TestPass123!',
      role: 'educator',
      display_name: 'Test Educator',
    },
    {
      email: 'learner@abr-insights.com',
      password: 'TestPass123!',
      role: 'learner',
      display_name: 'Test Learner',
    },
  ]

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.display_name,
          role: user.role,
        },
      })

      if (error) {
        console.log(`❌ ${user.email}: ${error.message}`)
        continue
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
        })

        if (profileError) {
          console.log(`❌ ${user.email}: Profile error - ${profileError.message}`)
        } else {
          console.log(`✅ ${user.email} - ${user.role}`)
        }
      }
    } catch (error: any) {
      console.log(`❌ ${user.email}: ${error.message}`)
    }
  }
}

cleanDatabase().catch(console.error)
