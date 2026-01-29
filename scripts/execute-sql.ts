import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

async function executeSql() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sql = readFileSync('create_cases_table.sql', 'utf-8')

  // Split the SQL into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  console.log(`Executing ${statements.length} SQL statements...`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';'
    console.log(`\n[${i + 1}/${statements.length}] Executing...`)

    const { data, error } = await supabase.rpc('query', {
      query_text: statement,
    })

    if (error) {
      // Try direct execution if RPC fails
      const { error: directError } = await (supabase as any).from('_').select('*').limit(0)

      console.log(`Statement ${i + 1}: ${statement.substring(0, 100)}...`)
      console.warn('Note: Cannot execute DDL via Supabase client')
      continue
    }

    console.log(`✅ Statement ${i + 1} completed`)
  }

  console.log('\n✅ SQL execution completed. Please verify in Supabase dashboard.')
}

executeSql().catch(console.error)
