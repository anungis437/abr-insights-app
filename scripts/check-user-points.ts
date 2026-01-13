import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUserPoints() {
  const userId = 'e2baace7-c036-4700-b112-ce17e8c1ed84';
  
  // Test with service role key first
  console.log('1. Testing user_points with service role key...');
  const { data: up1, error: upError1 } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId);
  
  if (upError1) {
    console.log('Error:', upError1.message);
    console.log('Hint:', upError1.hint);
    console.log('Details:', upError1.details);
    console.log('Code:', upError1.code);
  } else {
    console.log('Success:', up1);
  }

  // Check table structure
  console.log('\n2. Checking user_points table structure...');
  const { data: structure } = await supabase
    .from('user_points')
    .select('*')
    .limit(0);
  console.log('Table accessible');

  // Try to insert a test record
  console.log('\n3. Testing insert into user_points...');
  const { data: inserted, error: insertError } = await supabase
    .from('user_points')
    .insert({
      user_id: userId,
      total_points: 0,
      level: 1
    })
    .select();
  
  if (insertError) {
    console.log('Insert error:', insertError.message);
    console.log('Hint:', insertError.hint);
    console.log('Details:', insertError.details);
  } else {
    console.log('Insert success:', inserted);
  }

  // Check RLS policies
  console.log('\n4. Checking if record exists...');
  const { data: exists, error: existsError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId);
  
  if (existsError) {
    console.log('Error:', existsError.message);
  } else {
    console.log('Records found:', exists?.length || 0);
    if (exists?.[0]) {
      console.log('Columns:', Object.keys(exists[0]).join(', '));
    }
  }
}

checkUserPoints();
