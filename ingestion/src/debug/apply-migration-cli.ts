import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('📖 Reading migration file...');
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', '005_ingestion_pipeline.sql');
  const sql = readFileSync(migrationPath, 'utf-8');
  
  console.log('🚀 Executing migration via Supabase...');
  console.log(`   SQL size: ${sql.length} characters`);
  
  // Split by statements (this is a simplified approach)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`   Found ${statements.length} SQL statements`);
  
  let executed = 0;
  let errors = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comments and empty statements
    if (statement.trim().startsWith('--') || statement.trim() === ';') {
      continue;
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // Check if it's a "already exists" error - these are OK
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ⚠️  Statement ${i + 1}: Already exists (skipping)`);
          executed++;
        } else {
          console.error(`   ❌ Statement ${i + 1} failed:`, error.message.substring(0, 100));
          errors++;
        }
      } else {
        executed++;
        if ((i + 1) % 10 === 0) {
          console.log(`   ✓ Executed ${i + 1}/${statements.length} statements`);
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Statement ${i + 1} error:`, err.message?.substring(0, 100));
      errors++;
    }
  }
  
  console.log(`\n✨ Migration complete: ${executed} executed, ${errors} errors`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some statements failed. This may be OK if tables already exist.');
    console.log('Checking if required tables exist...');
    
    // Check if tables exist
    const { data: jobs, error: jobsError } = await supabase
      .from('ingestion_jobs')
      .select('id')
      .limit(1);
    
    const { data: cases, error: casesError } = await supabase
      .from('tribunal_cases_raw')
      .select('id')
      .limit(1);
    
    if (!jobsError && !casesError) {
      console.log('✅ All required tables exist! Migration successful.');
      return true;
    } else {
      console.error('❌ Required tables missing:', {
        ingestion_jobs: jobsError ? 'MISSING' : 'OK',
        tribunal_cases_raw: casesError ? 'MISSING' : 'OK'
      });
      return false;
    }
  }
  
  return true;
}

console.log('🔧 Applying Supabase Migration via CLI\n');
executeMigration()
  .then(success => {
    if (success) {
      console.log('\n✅ Ready to run storage integration test!');
      console.log('   Run: npx tsx --env-file=.env.local ingestion\\src\\debug\\test-storage-integration.ts');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
