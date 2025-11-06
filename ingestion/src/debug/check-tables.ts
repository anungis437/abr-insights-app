import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('Checking if ingestion_jobs table exists...');
  
  const { error: jobError } = await supabase
    .from('ingestion_jobs')
    .select('id')
    .limit(1);
  
  const { error: caseError } = await supabase
    .from('tribunal_cases_raw')
    .select('id')
    .limit(1);
  
  if (!jobError && !caseError) {
    console.log('✅ All tables already exist!');
    return true;
  }
  
  console.log('Tables need to be created.');
  console.log('\n❌ Supabase client cannot execute DDL statements (CREATE TABLE).');
  console.log('You need to apply the migration via Supabase Dashboard:');
  console.log('\n1. Go to: https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new');
  console.log('2. Copy the contents of: supabase\\migrations\\005_ingestion_pipeline.sql');
  console.log('3. Paste into SQL Editor and click "Run"');
  console.log('\nOr use psql if installed:');
  console.log('  psql $DATABASE_URL < supabase\\migrations\\005_ingestion_pipeline.sql');
  
  return false;
}

checkAndCreateTables()
  .then(exists => {
    if (exists) {
      console.log('\n✅ Ready to run storage integration test:');
      console.log('   npx tsx --env-file=.env.local ingestion\\src\\debug\\test-storage-integration.ts');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
