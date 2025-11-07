import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error connecting to profiles table:', error.message);
    } else {
      console.log('✓ Supabase connected successfully');
      console.log('✓ profiles table exists');
    }

    // Test auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('⚠ Auth not configured:', authError.message);
    } else {
      console.log('✓ Supabase Auth available');
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
}

testConnection();
