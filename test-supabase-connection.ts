// Quick test to verify Supabase connection and data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');
  console.log('');

  try {
    // Test 1: Check if cases table exists and get count
    const { count, error } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error accessing cases table:', error.message);
      return;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Total cases in database: ${count || 0}`);

    // Test 2: Get a sample of cases
    if (count && count > 0) {
      const { data: sampleCases, error: sampleError } = await supabase
        .from('cases')
        .select('id, case_title, case_number, decision_date')
        .limit(3);

      if (sampleError) {
        console.error('❌ Error fetching sample cases:', sampleError.message);
        return;
      }

      console.log('\n📋 Sample cases:');
      sampleCases?.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.case_title || c.case_number || 'Untitled'}`);
        console.log(`     ID: ${c.id}`);
        console.log(`     Date: ${c.decision_date || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  No cases found in database. Run the ingestion script to populate data.');
    }

    // Test 3: Check table structure
    console.log('\n🔧 Checking table structure...');
    const { data: tableInfo, error: schemaError } = await supabase
      .from('cases')
      .select('*')
      .limit(1);

    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table columns detected:');
      Object.keys(tableInfo[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
