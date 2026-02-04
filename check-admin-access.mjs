import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAdminAccess() {
  console.log('\n=== Checking Admin Access ===\n')

  // Get admin user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, display_name')
    .eq('email', 'admin@abrinsights.ca')

  if (!profiles || profiles.length === 0) {
    console.log('❌ Admin user not found')
    return
  }

  const admin = profiles[0]
  console.log('Admin User:')
  console.log('  Email:', admin.email)
  console.log('  Role:', admin.role)
  console.log('  Display Name:', admin.display_name)

  // Check what roles allow course creation
  console.log('\n=== Course Create Page Auth Check ===')
  const allowedForCourse = ['super_admin', 'org_admin', 'educator']
  const canAccessCourse = allowedForCourse.includes(admin.role)
  console.log('Allowed roles:', allowedForCourse.join(', '))
  console.log('Can access:', canAccessCourse ? '✅ YES' : '❌ NO')

  // Check what roles allow case creation
  console.log('\n=== Case Create Page Auth Check ===')
  const allowedForCase = ['super_admin', 'org_admin', 'compliance_officer', 'educator']
  const canAccessCase = allowedForCase.includes(admin.role)
  console.log('Allowed roles:', allowedForCase.join(', '))
  console.log('Can access:', canAccessCase ? '✅ YES' : '❌ NO')

  if (!canAccessCourse || !canAccessCase) {
    console.log('\n⚠️  Admin role does not match expected roles!')
    console.log('   Expected: super_admin, org_admin, educator, or compliance_officer')
    console.log('   Actual:', admin.role)
  }
}

checkAdminAccess()
