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

async function deleteAllUsers() {
  console.log('🗑️  Deleting all existing test users...\n');
  
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  
  if (!allUsers?.users || allUsers.users.length === 0) {
    console.log('No users to delete.');
    return;
  }
  
  for (const user of allUsers.users) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.log(`⚠️  Could not delete ${user.email}: ${error.message}`);
      } else {
        console.log(`✅ Deleted ${user.email}`);
      }
    } catch (error: any) {
      console.log(`❌ Error deleting ${user.email}: ${error.message}`);
    }
  }
}

deleteAllUsers().catch(console.error);
