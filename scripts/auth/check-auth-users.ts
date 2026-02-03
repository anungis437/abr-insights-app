import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL!

async function checkAuthUsers() {
  const client = new pg.Client({ connectionString: databaseUrl })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL')
    console.log('')

    // Check if auth schema exists
    const schemaCheck = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'auth'
    `)

    if (schemaCheck.rows.length === 0) {
      console.log('❌ auth schema not found')
      console.log('This is expected for Supabase managed auth.')
      console.log('')
      console.log('📌 You need to create users via Supabase Dashboard:')
      console.log('1. Go to: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz')
      console.log('2. Click "Authentication" in sidebar')
      console.log('3. Click "Users" tab')
      console.log('4. Click "Add User" button')
      console.log('')
      console.log('Create this user:')
      console.log('   Email: super_admin@abr-insights.com')
      console.log('   Password: TestPass123!')
      console.log('   Auto Confirm: Yes')
      console.log('')
      console.log('OR use Supabase CLI:')
      console.log(
        '   supabase auth users create super_admin@abr-insights.com --password TestPass123!'
      )
    } else {
      console.log('✅ auth schema exists')

      // Try to count users
      const usersCheck = await client.query(`
        SELECT COUNT(*) as count 
        FROM auth.users
      `)

      console.log(`Found ${usersCheck.rows[0].count} users in auth.users`)

      if (usersCheck.rows[0].count > 0) {
        const users = await client.query(`
          SELECT id, email, email_confirmed_at, created_at
          FROM auth.users
          ORDER BY created_at
          LIMIT 10
        `)

        console.log('')
        console.log('Recent users:')
        users.rows.forEach((u) => {
          console.log(`  - ${u.email} (confirmed: ${!!u.email_confirmed_at})`)
        })
      }
    }

    console.log('')
    console.log('Checking profiles table:')
    const profilesCheck = await client.query(`
      SELECT COUNT(*) as count FROM profiles
    `)
    console.log(`Found ${profilesCheck.rows[0].count} profiles`)

    if (profilesCheck.rows[0].count > 0) {
      const profiles = await client.query(`
        SELECT id, email, full_name, role
        FROM profiles
        ORDER BY created_at
        LIMIT 10
      `)

      console.log('')
      console.log('Existing profiles:')
      profiles.rows.forEach((p) => {
        console.log(`  - ${p.email} (${p.role})`)
      })
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

checkAuthUsers()
