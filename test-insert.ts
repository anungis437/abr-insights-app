import { createClient } from '@supabase/supabase-js';

async function testInsert() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Testing insert into cases table...');

  const testRecord = {
    source_url: 'https://test.example.com/case-001',
    source_system: 'canlii_hrto',
    case_title: 'Test Case v. Test Respondent',
    case_number: 'TEST-001',
    citation: '2024 TEST 001',
    tribunal_name: 'Test Tribunal',
    decision_date: '2024-01-15',
    applicant: 'Test Applicant',
    respondent: 'Test Respondent',
    full_text: 'This is a test case document.',
    document_type: 'decision',
    rule_based_classification: {
      category: 'anti_black_racism',
      confidence: 0.85,
    },
    ai_classification: null,
    combined_confidence: 0.85,
    needs_review: true,
  };

  const { data, error } = await supabase
    .from('cases')
    .insert(testRecord)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    console.error('Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Successfully inserted:', data);
  }
}

testInsert().catch(console.error);
