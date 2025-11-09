import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUser() {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, role, first_name, last_name')
    .eq('id', '7556a1e3-34d2-4425-b597-137f34998059')
    .single();

  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Profile:', data);
  }
}

checkUser();
