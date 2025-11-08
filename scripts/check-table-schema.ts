/**
 * Check specific table schema - course_reviews
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableSchema() {
  console.log('🔍 Checking course_reviews table schema...\n');

  try {
    // Try to select from the table to see what columns exist
    const { data, error } = await supabase
      .from('course_reviews')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying table:', error.message);
      console.log('Full error:', error);
    } else {
      console.log('✅ Table exists');
      console.log('Sample row structure:', data && data.length > 0 ? Object.keys(data[0]) : 'No rows yet');
    }

    // Try to query table structure via information_schema
    console.log('\n📋 Attempting to query column info...');
    
    // Since we can't query information_schema directly via Supabase client,
    // let's try to insert a test object and see what fails
    const testInsert = {
      course_id: '00000000-0000-0000-0000-000000000000',
      version_id: null,
      review_type: 'peer',
      reviewer_id: '00000000-0000-0000-0000-000000000000',
      decision: null,
      comments: 'test',
      is_completed: false,
    };

    console.log('\nTrying to identify missing columns by test insert...');
    const { error: insertError } = await supabase
      .from('course_reviews')
      .insert(testInsert)
      .select();

    if (insertError) {
      console.log('Insert error (expected):', insertError.message);
      
      if (insertError.message.includes('reviewer_id')) {
        console.log('\n❌ CONFIRMED: reviewer_id column is MISSING from course_reviews table');
      }
      if (insertError.message.includes('column')) {
        console.log('Missing or invalid column detected');
      }
    } else {
      console.log('✅ Test insert succeeded - all columns present');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTableSchema();
