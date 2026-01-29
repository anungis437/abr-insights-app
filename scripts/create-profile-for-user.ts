import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const email = process.argv[2]
const role = process.argv[3] || 'learner'

if (!email) {
  console.error('Usage: npx tsx scripts/create-profile-for-user.ts <email> [role]')
  console.error(
    'Example: npx tsx scripts/create-profile-for-user.ts super_admin@abr-insights.com super_admin'
  )
  process.exit(1)
}

async function createProfile() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL! })

  try {
    await client.connect()

    // Get user ID from auth.users
    const userResult = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [
      email,
    ])

    if (userResult.rows.length === 0) {
      console.error(`❌ User not found: ${email}`)
      console.error('')
      console.error('Create the user first via Supabase Dashboard:')
      console.error('https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/auth/users')
      process.exit(1)
    }

    const userId = userResult.rows[0].id
    console.log(`✅ Found user: ${email}`)
    console.log(`   ID: ${userId}`)

    // Check if profile already exists
    const profileCheck = await client.query('SELECT id FROM profiles WHERE id = $1', [userId])

    if (profileCheck.rows.length > 0) {
      console.log(`⚠️  Profile already exists for this user`)

      // Update role if different
      await client.query('UPDATE profiles SET role = $1, updated_at = NOW() WHERE id = $2', [
        role,
        userId,
      ])
      console.log(`✅ Updated role to: ${role}`)
      return
    }

    // Create profile
    const name = email
      .split('@')[0]
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    await client.query(
      `
      INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `,
      [userId, email, name, role]
    )

    console.log(`✅ Created profile:`)
    console.log(`   Name: ${name}`)
    console.log(`   Role: ${role}`)
    console.log('')
    console.log('🎉 User is ready! You can now login.')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

createProfile()
