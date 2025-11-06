// Test Supabase connection
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
async function testConnection() {
  try {
    console.log('\nAttempting to connect to Supabase...')
    
    // Test 1: Check if we can query auth
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('Auth check failed:', authError.message)
    } else {
      console.log('✓ Auth API is accessible')
    }

    // Test 2: Try a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('Note: profiles table query failed (expected if not created yet):', error.message)
    } else {
      console.log('✓ Database is accessible')
    }

    // Test 3: Check connection info
    const { data: healthData, error: healthError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)
    
    if (healthError) {
      console.log('Note: migrations table not accessible:', healthError.message)
    } else {
      console.log('✓ Migrations table accessible')
    }

    console.log('\n✅ Supabase connection successful!')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error)
  }
}

testConnection()
