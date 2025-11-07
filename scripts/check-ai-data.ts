import { createClient } from '@supabase/supabase-js';

async function checkAIData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Checking for AI classification data...\n');

  const { data, error } = await supabase
    .from('cases')
    .select('case_title, ai_classification, rule_based_classification, combined_confidence')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No cases found');
    return;
  }

  data.forEach((caseData, idx) => {
    console.log(`${idx + 1}. ${caseData.case_title}`);
    console.log(`   Combined Confidence: ${caseData.combined_confidence}`);
    console.log(`   Rule-based: ${caseData.rule_based_classification ? '✅ Present' : '❌ Missing'}`);
    console.log(`   AI Analysis: ${caseData.ai_classification ? '✅ Present' : '❌ Missing'}`);
    
    if (caseData.ai_classification) {
      console.log(`   AI Category: ${caseData.ai_classification.category}`);
      console.log(`   AI Confidence: ${caseData.ai_classification.confidence}`);
      console.log(`   AI Reasoning: ${caseData.ai_classification.reasoning?.substring(0, 100)}...`);
    }
    console.log('');
  });
}

checkAIData().catch(console.error);
