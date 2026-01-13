import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  { email: 'super_admin@abr-insights.com', password: 'TestPass123!', role: 'super_admin', display_name: 'Super Administrator' },
  { email: 'compliance@abr-insights.com', password: 'TestPass123!', role: 'compliance_officer', display_name: 'Compliance Officer' },
  { email: 'org_admin@abr-insights.com', password: 'TestPass123!', role: 'org_admin', display_name: 'Organization Admin' },
  { email: 'analyst@abr-insights.com', password: 'TestPass123!', role: 'analyst', display_name: 'Data Analyst' },
  { email: 'investigator@abr-insights.com', password: 'TestPass123!', role: 'investigator', display_name: 'Case Investigator' },
  { email: 'educator@abr-insights.com', password: 'TestPass123!', role: 'educator', display_name: 'Educator' },
  { email: 'learner@abr-insights.com', password: 'TestPass123!', role: 'learner', display_name: 'Learner' },
  { email: 'viewer@abr-insights.com', password: 'TestPass123!', role: 'viewer', display_name: 'Viewer' },
  { email: 'guest@abr-insights.com', password: 'TestPass123!', role: 'guest', display_name: 'Guest User' },
];

async function main() {
  console.log('🧹 Step 1: Cleaning up existing users...\n');
  
  // Delete users from auth.users
  for (const user of testUsers) {
    try {
      // First, get the user ID
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userToDelete = existingUser?.users?.find(u => u.email === user.email);
      
      if (userToDelete) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        if (deleteError) {
          console.log(`⚠️  Could not delete ${user.email}: ${deleteError.message}`);
        } else {
          console.log(`✅ Deleted ${user.email}`);
        }
      }
    } catch (error: any) {
      console.log(`⚠️  Error checking ${user.email}: ${error.message}`);
    }
  }
  
  console.log('\n✨ Step 2: Creating users properly via Auth API...\n');
  
  const results = {
    success: [] as string[],
    failed: [] as string[],
  };
  
  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.display_name,
          role: user.role,
        },
      });
      
      if (error) {
        console.log(`❌ Failed to create ${user.email}: ${error.message}`);
        results.failed.push(user.email);
        continue;
      }
      
      if (!data.user) {
        console.log(`❌ Failed to create ${user.email}: No user data returned`);
        results.failed.push(user.email);
        continue;
      }
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.log(`⚠️  Created user ${user.email} but profile creation failed: ${profileError.message}`);
        results.failed.push(user.email);
      } else {
        console.log(`✅ Created ${user.email} (${user.role}) - ID: ${data.user.id}`);
        results.success.push(user.email);
      }
      
    } catch (error: any) {
      console.log(`❌ Error creating ${user.email}: ${error.message}`);
      results.failed.push(user.email);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.success.length > 0) {
    console.log('\n🎉 Success! You can now login with any of these accounts:');
    console.log('   Email: super_admin@abr-insights.com');
    console.log('   Password: TestPass123!');
    console.log('\n   Or try any other test account from the list above.');
  }
}

main().catch(console.error);
