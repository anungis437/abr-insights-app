import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase API Key Tester');
console.log('===========================');
console.log('');

// Check if variables are loaded
console.log('Environment Variables:');
console.log(`  URL: ${url || '❌ NOT FOUND'}`);
console.log(`  Anon Key: ${anonKey ? `✅ ${anonKey.substring(0, 20)}...` : '❌ NOT FOUND'}`);
console.log(`  Service Key: ${serviceKey ? `✅ ${serviceKey.substring(0, 20)}...` : '❌ NOT FOUND'}`);
console.log('');

if (!url || !anonKey) {
  console.error('❌ Missing required environment variables!');
  console.error('');
  console.error('Please check .env.local file.');
  process.exit(1);
}

async function testKeys() {
  console.log('Testing Anon Key...');
  
  try {
    // Test anon key by fetching auth config
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey!
      }
    });
    
    if (response.ok) {
      console.log('  ✅ Anon key is VALID');
      const data = await response.json();
      console.log(`  Auth enabled: ${data.external?.email ? 'Yes' : 'Unknown'}`);
    } else {
      console.log('  ❌ Anon key is INVALID');
      console.log(`  Status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`  Error: ${text.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.log('  ❌ Connection failed:', error.message);
  }
  
  console.log('');
  
  if (serviceKey) {
    console.log('Testing Service Role Key...');
    
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      
      if (response.ok || response.status === 404) {
        console.log('  ✅ Service key is VALID');
      } else {
        console.log('  ❌ Service key is INVALID');
        console.log(`  Status: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.log('  ❌ Connection failed:', error.message);
    }
  }
  
  console.log('');
  console.log('===========================');
  console.log('');
  console.log('If keys are invalid:');
  console.log('1. Go to: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/settings/api');
  console.log('2. Copy the correct "anon public" and "service_role" keys');
  console.log('3. Update .env.local');
  console.log('4. Restart dev server: npm run dev');
}

testKeys();
