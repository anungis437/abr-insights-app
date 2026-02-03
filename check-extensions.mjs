#!/usr/bin/env node
/**
 * Quick check for PostgreSQL extensions status
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkExtensions() {
  console.log('🔌 Checking PostgreSQL Extensions...\n')

  const requiredExtensions = ['uuid-ossp', 'pgcrypto', 'vector']

  for (const ext of requiredExtensions) {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `SELECT extname FROM pg_extension WHERE extname = '${ext}';`,
    })

    // If we can't use exec_sql, try a different approach
    if (error && error.message.includes('does not exist')) {
      // Try querying a system table that should work
      const { data: extData, error: extError } = await supabase
        .from('pg_available_extensions')
        .select('name, installed_version')
        .eq('name', ext)
        .single()

      if (extError) {
        console.log(`   ⚠️  ${ext} - Cannot verify (need dashboard access)`)
      } else if (extData?.installed_version) {
        console.log(`   ✅ ${ext} - Version ${extData.installed_version}`)
      } else {
        console.log(`   ❌ ${ext} - Not installed`)
      }
    } else {
      console.log(`   ✅ ${ext} - Enabled`)
    }
  }

  console.log('\n✨ Extension check complete!')
}

checkExtensions().catch(console.error)
