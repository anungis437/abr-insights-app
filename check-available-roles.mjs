import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

console.log('Checking available roles...\n');

const { data: roles, error } = await supabase
  .from('roles')
  .select('id, name, description')
  .order('name');

if (error) {
  console.error('Error:', error);
} else {
  console.log(`Total roles: ${roles.length}\n`);
  roles.forEach(r => {
    console.log(`${r.name}`);
    console.log(`  ID: ${r.id}`);
    console.log(`  Description: ${r.description || 'N/A'}\n`);
  });
}
