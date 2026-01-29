import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getTableColumns() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('watch_history', 'lesson_progress', 'user_points')
      ORDER BY table_name, ordinal_position;
    `,
  })

  if (error) {
    console.error('Error:', error)
    // Fallback: try inserting test records to see what columns exist
    console.log('\nTrying fallback method...')

    // Test watch_history
    const { error: whError } = await supabase
      .from('watch_history')
      .insert({
        user_id: 'test',
        lesson_id: 'test',
        // Try different possible column names
      })
      .select()

    console.log('watch_history error:', whError?.message, whError?.hint)
  } else {
    console.log('Table Columns:')
    console.log(JSON.stringify(data, null, 2))
  }
}

getTableColumns()
