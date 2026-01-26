import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

console.log('Checking user roles...\n');

// Get all profiles with their assigned roles
const { data: profiles, error } = await supabase
  .from('profiles')
  .select('email, first_name, last_name')
  .order('email');

if (error) {
  console.error('Error fetching profiles:', error);
  process.exit(1);
}

console.log(`Found ${profiles.length} profiles\n`);

for (const profile of profiles) {
  // Get user ID from profiles
  const { data: profileWithId } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', profile.email)
    .single();
  
  // Get assigned roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', profileWithId.id);
  
  const roleNames = userRoles?.map(ur => ur.roles?.name).filter(Boolean).join(', ') || 'NO ROLES';
  
  console.log(`${profile.email}`);
  console.log(`  Name: ${profile.first_name} ${profile.last_name}`);
  console.log(`  Roles: ${roleNames}`);
  console.log(`  Role count: ${userRoles?.length || 0}\n`);
}
