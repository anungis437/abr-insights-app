import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const tables = ['cases', 'tribunal_cases_raw', 'raw_cases'];

async function checkTables() {
  console.log('Checking which tables exist...\n');
  
  for (const t of tables) {
    try {
      const { error } = await supabase.from(t).select('id').limit(1);
      console.log(`${t}: ${error ? `❌ NOT FOUND - ${error.message}` : '✅ EXISTS'}`);
    } catch (e) {
      console.log(`${t}: ❌ ERROR`);
    }
  }
}

checkTables();
