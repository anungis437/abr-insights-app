import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  { email: 'super_admin@abr-insights.com', role: 'super_admin', name: 'Super Admin' },
  { email: 'compliance@abr-insights.com', role: 'compliance_officer', name: 'Compliance Officer' },
  { email: 'orgadmin@abr-insights.com', role: 'org_admin', name: 'Organization Admin' },
  { email: 'analyst@abr-insights.com', role: 'analyst', name: 'Data Analyst' },
  { email: 'investigator@abr-insights.com', role: 'investigator', name: 'Case Investigator' },
  { email: 'educator@abr-insights.com', role: 'educator', name: 'Course Educator' },
  { email: 'learner@abr-insights.com', role: 'learner', name: 'Student Learner' },
  { email: 'viewer@abr-insights.com', role: 'viewer', name: 'Read-Only Viewer' },
  { email: 'guest@abr-insights.com', role: 'guest', name: 'Guest User' }
];

const password = 'TestPass123!';

async function createTestUsers() {
  console.log('🔧 ABR Insights - Test User Setup');
  console.log('===================================');
  console.log('');

  let created = 0;
  let existing = 0;
  let failed = 0;

  for (const user of testUsers) {
    try {
      console.log(`Creating: ${user.email} (${user.role})`);

      // Create user via Admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: user.name,
          role: user.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  Already exists`);
          existing++;
        } else {
          console.log(`  ❌ Failed: ${authError.message}`);
          failed++;
        }
        continue;
      }

      // Create profile in public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.user!.id,
          email: user.email,
          full_name: user.name,
          role: user.role,
          organization_id: null,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.log(`  ⚠️  Profile error: ${profileError.message}`);
      } else {
        console.log(`  ✅ Created successfully`);
        created++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('===================================');
  console.log('Summary');
  console.log('===================================');
  console.log(`Total users: ${testUsers.length}`);
  console.log(`Created: ${created}`);
  console.log(`Already exist: ${existing}`);
  console.log(`Failed: ${failed}`);
  console.log('');

  if (created > 0 || existing === testUsers.length) {
    console.log('✅ Test users are ready!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Email: super_admin@abr-insights.com');
    console.log('   Password: TestPass123!');
    console.log('');
    console.log('   (All accounts use the same password)');
    console.log('');
    console.log('🌐 Login at: http://localhost:3001/auth/login');
  } else {
    console.log('⚠️  Some users could not be created.');
    console.log('Check errors above for details.');
    process.exit(1);
  }
}

createTestUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
