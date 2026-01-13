import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing login with org_admin@abr-insights.com...\n');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'org_admin@abr-insights.com',
    password: 'TestPass123!',
  });
  
  if (error) {
    console.log(`❌ Login failed: ${error.message}`);
    console.log(`Error details:`, error);
    return;
  }
  
  console.log('✅ Login successful!');
  console.log(`User ID: ${data.user?.id}`);
  console.log(`Email: ${data.user?.email}`);
  console.log(`Access Token: ${data.session?.access_token?.substring(0, 50)}...`);
  
  // Try to fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user?.id)
    .single();
  
  if (profileError) {
    console.log(`⚠️  Could not fetch profile: ${profileError.message}`);
  } else {
    console.log('\n👤 Profile:');
    console.log(`  Display Name: ${profile.display_name}`);
    console.log(`  Role: ${profile.role}`);
  }
}

testLogin().catch(console.error);
