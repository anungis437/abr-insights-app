import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking roles and permissions with service role key...\n');

async function checkData() {
  // Check roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*');
  
  console.log('Roles:', roles?.length || 0);
  if (rolesError) console.error('Roles error:', rolesError);
  if (roles) roles.forEach(r => console.log(`  - ${r.name} (${r.slug})`));

  // Check permissions
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('*');
  
  console.log('\nPermissions:', permissions?.length || 0);
  if (permError) console.error('Permissions error:', permError);
  if (permissions) permissions.slice(0, 5).forEach(p => console.log(`  - ${p.name} (${p.slug})`));

  // Check tribunal_cases
  const { data: cases, error: casesError } = await supabase
    .from('tribunal_cases')
    .select('id, case_number, title')
    .limit(5);
  
  console.log('\nTribunal Cases:', cases?.length || 0);
  if (casesError) console.error('Cases error:', casesError);
  if (cases) cases.forEach(c => console.log(`  - ${c.case_number}: ${c.title}`));
}

checkData().catch(console.error);
