import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment')
  process.exit(1)
}

async function applyMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected')

    // Read migration file
    const migrationPath = resolve(
      process.cwd(),
      'supabase/migrations/020_evidence_bundles_tracking.sql'
    )
    console.log(`📄 Reading migration: ${migrationPath}`)
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('🚀 Applying evidence bundles migration...')
    await client.query(migrationSQL)
    console.log('✅ Migration applied successfully')

    // Verify table creation
    console.log('\n🔍 Verifying table creation...')
    const verifyTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'evidence_bundle_pdfs'
      );
    `)
    
    if (verifyTable.rows[0].exists) {
      console.log('✅ evidence_bundle_pdfs table created')
    } else {
      console.log('⚠️ evidence_bundle_pdfs table not found')
    }

    // Verify function creation
    const verifyFunction = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'increment_bundle_pdf_access'
      );
    `)
    
    if (verifyFunction.rows[0].exists) {
      console.log('✅ increment_bundle_pdf_access function created')
    } else {
      console.log('⚠️ increment_bundle_pdf_access function not found')
    }

    // Verify RLS policies
    const verifyPolicies = await client.query(`
      SELECT COUNT(*) as policy_count
      FROM pg_policies
      WHERE tablename = 'evidence_bundle_pdfs';
    `)
    
    console.log(`✅ ${verifyPolicies.rows[0].policy_count} RLS policies created`)

    // Show table structure
    console.log('\n📋 Table structure:')
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'evidence_bundle_pdfs'
      ORDER BY ordinal_position;
    `)
    
    columns.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`)
    })

    console.log('\n✅ Evidence bundles migration complete!')
    console.log('\n📝 Next steps:')
    console.log('  1. Configure Supabase Storage bucket: evidence-bundle-pdfs')
    console.log('  2. See docs/deployment/EVIDENCE_BUNDLES_STORAGE_SETUP.md for setup')

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

applyMigration()
