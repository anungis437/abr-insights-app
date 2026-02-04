import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkComplianceTables() {
  console.log('\n=== Checking Compliance Database Tables ===\n')

  // Check compliance_reports table
  console.log('1. Checking compliance_reports table...')
  const { data: reports, error: reportsError } = await supabase
    .from('compliance_reports')
    .select('*')
    .limit(5)

  if (reportsError) {
    console.log('❌ compliance_reports error:', reportsError.message)
  } else {
    console.log(`✅ compliance_reports table exists`)
    console.log(`   Found ${reports?.length || 0} reports`)
    if (reports && reports.length > 0) {
      console.log('   Sample:', reports[0])
    }
  }

  // Check audit_log_exports table
  console.log('\n2. Checking audit_log_exports table...')
  const { data: exports, error: exportsError } = await supabase
    .from('audit_log_exports')
    .select('*')
    .limit(5)

  if (exportsError) {
    console.log('❌ audit_log_exports error:', exportsError.message)
  } else {
    console.log(`✅ audit_log_exports table exists`)
    console.log(`   Found ${exports?.length || 0} exports`)
  }

  // Check audit_logs table
  console.log('\n3. Checking audit_logs table...')
  const { data: logs, error: logsError } = await supabase.from('audit_logs').select('*').limit(5)

  if (logsError) {
    console.log('❌ audit_logs error:', logsError.message)
  } else {
    console.log(`✅ audit_logs table exists`)
    console.log(`   Found ${logs?.length || 0} audit log entries`)
    if (logs && logs.length > 0) {
      console.log('   Latest log:', {
        action: logs[0].action,
        actor_id: logs[0].actor_id,
        created_at: logs[0].created_at,
      })
    }
  }

  // Check evidence_bundles table
  console.log('\n4. Checking evidence_bundles table...')
  const { data: evidence, error: evidenceError } = await supabase
    .from('evidence_bundles')
    .select('*')
    .limit(5)

  if (evidenceError) {
    console.log('❌ evidence_bundles error:', evidenceError.message)
  } else {
    console.log(`✅ evidence_bundles table exists`)
    console.log(`   Found ${evidence?.length || 0} evidence bundles`)
  }

  // Check tribunal_cases table
  console.log('\n5. Checking tribunal_cases table...')
  const { data: cases, error: casesError } = await supabase
    .from('tribunal_cases')
    .select('*')
    .limit(5)

  if (casesError) {
    console.log('❌ tribunal_cases error:', casesError.message)
  } else {
    console.log(`✅ tribunal_cases table exists`)
    console.log(`   Found ${cases?.length || 0} tribunal cases`)
    if (cases && cases.length > 0) {
      console.log('   Sample case:', {
        title: cases[0].title,
        jurisdiction: cases[0].jurisdiction,
        status: cases[0].status,
      })
    }
  }

  // Check RPC function
  console.log('\n6. Checking detect_audit_anomalies RPC function...')
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const { data: anomalies, error: rpcError } = await supabase.rpc('detect_audit_anomalies', {
      org_id: '00000000-0000-0000-0000-000000000000', // dummy ID
      start_date: startDate.toISOString(),
      end_date: new Date().toISOString(),
    })

    if (rpcError) {
      console.log('❌ RPC function error:', rpcError.message)
    } else {
      console.log('✅ detect_audit_anomalies RPC function exists and works')
    }
  } catch (e) {
    console.log('❌ RPC function error:', e.message)
  }

  console.log('\n═══════════════════════════════════════')
  console.log('📊 COMPLIANCE DATABASE STATUS')
  console.log('═══════════════════════════════════════')

  const tables = [
    { name: 'compliance_reports', exists: !reportsError },
    { name: 'audit_log_exports', exists: !exportsError },
    { name: 'audit_logs', exists: !logsError },
    { name: 'evidence_bundles', exists: !evidenceError },
    { name: 'tribunal_cases', exists: !casesError },
  ]

  const allExist = tables.every((t) => t.exists)

  if (allExist) {
    console.log('✅ All compliance tables are wired to the database')
  } else {
    console.log('❌ Some tables are missing:')
    tables
      .filter((t) => !t.exists)
      .forEach((t) => {
        console.log(`   - ${t.name}`)
      })
  }
}

checkComplianceTables()
