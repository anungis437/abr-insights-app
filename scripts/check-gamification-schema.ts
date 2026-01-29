import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || '***REMOVED***'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGamificationSchema() {
  console.log('Checking Gamification Tables Schema...\n')

  const tables = [
    'achievements',
    'user_achievements',
    'user_points',
    'achievement_categories',
    'achievement_progress',
    'user_streaks',
    'points_sources',
    'points_transactions',
    'rewards_catalog',
    'leaderboards',
  ]

  for (const table of tables) {
    console.log(`\n=== ${table} ===`)

    // Check if table exists
    const { data: tableExists, error: existsError } = await supabase
      .from(table)
      .select('*')
      .limit(0)

    if (existsError) {
      console.log(`❌ Table does not exist or is not accessible`)
      console.log(`Error: ${existsError.message}`)
      continue
    }

    console.log(`✅ Table exists`)

    // Get schema info using RPC
    const { data: columns, error: schemaError } = await supabase.rpc('get_table_columns', {
      table_name: table,
    })

    if (schemaError) {
      // Fallback: try to get sample row to infer columns
      const { data: sample, error: sampleError } = await supabase.from(table).select('*').limit(1)

      if (!sampleError && sample && sample.length > 0) {
        console.log(`Columns (from sample):`, Object.keys(sample[0]).join(', '))
      } else {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        console.log(`Row count: ${count || 0}`)
      }
    } else {
      console.log(`Columns:`, columns)
    }
  }
}

checkGamificationSchema().catch(console.error)
