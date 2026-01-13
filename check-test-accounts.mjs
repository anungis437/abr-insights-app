import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAccounts() {
  try {
    console.log('Checking test accounts...\n');
    
    // Check profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, display_name, status')
      .order('email');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }
    
    console.log(`📊 Total profiles: ${profiles?.length || 0}\n`);
    
    if (profiles && profiles.length > 0) {
      console.log('User Profiles:');
      profiles.forEach(p => {
        const name = p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'No name';
        const status = p.status === 'active' ? '✓' : '○';
        console.log(`  ${status} ${p.email} - ${name} (${p.status})`);
      });
    } else {
      console.log('⚠️  No profiles found!');
    }
    
    // Check user_roles
    console.log('\n---\n');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(email),
        roles!inner(name)
      `);
    
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
    } else {
      console.log(`📋 Total user-role assignments: ${userRoles?.length || 0}\n`);
      
      if (userRoles && userRoles.length > 0) {
        console.log('User Roles:');
        userRoles.forEach(ur => {
          console.log(`  • ${ur.profiles?.email || 'Unknown'} → ${ur.roles?.name || 'Unknown role'}`);
        });
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAccounts();
