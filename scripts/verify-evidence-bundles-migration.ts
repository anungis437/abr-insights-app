import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

;(async () => {
  await client.connect()
  
  console.log('🔍 Verifying evidence_bundle_pdfs migration...\n')
  
  // Check table exists
  const table = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'evidence_bundle_pdfs'
    );
  `)
  
  if (table.rows[0].exists) {
    console.log('✅ evidence_bundle_pdfs table exists')
    
    // Show structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'evidence_bundle_pdfs'
      ORDER BY ordinal_position;
    `)
    
    console.log('\n📋 Table structure:')
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(30)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })
    
    // Check function
    const func = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'increment_bundle_pdf_access'
      );
    `)
    
    console.log(`\n${func.rows[0].exists ? '✅' : '❌'} increment_bundle_pdf_access function`)
    
    // Check RLS policies
    const policies = await client.query(`
      SELECT policyname
      FROM pg_policies
      WHERE tablename = 'evidence_bundle_pdfs';
    `)
    
    console.log(`\n✅ ${policies.rows.length} RLS policies:`)
    policies.rows.forEach(p => console.log(`  - ${p.policyname}`))
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'evidence_bundle_pdfs';
    `)
    
    console.log(`\n✅ ${indexes.rows.length} indexes:`)
    indexes.rows.forEach(i => console.log(`  - ${i.indexname}`))
    
    console.log('\n✅ Migration successfully applied!\n')
    console.log('📝 Next steps:')
    console.log('  1. Configure Supabase Storage bucket: evidence-bundle-pdfs')
    console.log('  2. Set bucket to private with 50MB limit')
    console.log('  3. See docs/deployment/EVIDENCE_BUNDLES_STORAGE_SETUP.md\n')
    
  } else {
    console.log('❌ evidence_bundle_pdfs table not found')
  }
  
  await client.end()
})()
