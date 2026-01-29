import { createClient } from '@supabase/supabase-js'

async function getTableSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Try to get one record to see the columns
  const { data, error } = await supabase.from('tribunal_cases_raw').select('*').limit(1)

  if (error) {
    console.error('Error fetching schema:', error)
  } else {
    console.log('tribunal_cases_raw columns:')
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]))
    } else {
      console.log('No data in table to infer schema')

      // Try inserting a minimal record to see what's required
      const testRecord = {
        source_url: 'https://test-schema.example.com',
        source_system: 'test',
        full_text: 'test',
      }

      const { data: insertData, error: insertError } = await supabase
        .from('tribunal_cases_raw')
        .insert(testRecord)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
      } else {
        console.log('Columns after insert:', Object.keys(insertData[0]))
      }
    }
  }
}

getTableSchema().catch(console.error)
