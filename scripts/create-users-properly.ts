import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const users = [
  { email: 'super_admin@abr-insights.com', role: 'super_admin' },
  { email: 'compliance@abr-insights.com', role: 'compliance_officer' },
  { email: 'orgadmin@abr-insights.com', role: 'org_admin' },
  { email: 'analyst@abr-insights.com', role: 'analyst' },
  { email: 'investigator@abr-insights.com', role: 'investigator' },
  { email: 'educator@abr-insights.com', role: 'educator' },
  { email: 'learner@abr-insights.com', role: 'learner' },
  { email: 'viewer@abr-insights.com', role: 'viewer' },
  { email: 'guest@abr-insights.com', role: 'guest' },
];

async function createUsers() {
  console.log('Creating users with Supabase Auth API...\n');
  
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'TestPass123!',
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.email.split('@')[0].replace('_', ' '),
      },
    });

    if (error) {
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        console.log(`⚠️  ${user.email} - already exists (skipping)`);
      } else {
        console.log(`❌ ${user.email} - Error: ${error.message}`);
      }
    } else {
      console.log(`✅ ${user.email} - Created (ID: ${data.user?.id})`);
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user!.id,
          email: user.email,
          role: user.role,
          full_name: user.email.split('@')[0].replace('_', ' '),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.log(`   ⚠️  Profile error: ${profileError.message}`);
      }
    }
  }
  
  console.log('\n✅ User creation complete!');
  console.log('Password for all users: TestPass123!');
}

createUsers().catch(console.error);
