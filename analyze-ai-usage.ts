import { createClient } from '@supabase/supabase-js';

async function analyzeAIUsage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('📊 Analyzing AI Classification Usage...\n');

  // Get all cases
  const { data, error } = await supabase
    .from('cases')
    .select('case_title, ai_classification, rule_based_classification, combined_confidence, needs_review, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No cases found');
    return;
  }

  const total = data.length;
  const withAI = data.filter(c => c.ai_classification).length;
  const withoutAI = total - withAI;
  const needsReview = data.filter(c => c.needs_review).length;

  // Category breakdown
  const antiBlackRacism = data.filter(c => 
    c.rule_based_classification?.category === 'anti_black_racism' ||
    c.ai_classification?.category === 'anti_black_racism'
  ).length;

  const aiAntiBlackRacism = data.filter(c => 
    c.ai_classification?.category === 'anti_black_racism'
  ).length;

  const ruleAntiBlackRacism = data.filter(c => 
    c.rule_based_classification?.category === 'anti_black_racism'
  ).length;

  console.log('='.repeat(60));
  console.log('DATABASE STATISTICS');
  console.log('='.repeat(60));
  console.log(`Total Cases:              ${total}`);
  console.log(`With AI Classification:   ${withAI} (${(withAI/total*100).toFixed(1)}%)`);
  console.log(`Rule-based Only:          ${withoutAI} (${(withoutAI/total*100).toFixed(1)}%)`);
  console.log(`Flagged for Review:       ${needsReview} (${(needsReview/total*100).toFixed(1)}%)`);
  console.log('');
  console.log('CLASSIFICATION BREAKDOWN:');
  console.log(`Anti-Black Racism (Any):  ${antiBlackRacism} (${(antiBlackRacism/total*100).toFixed(1)}%)`);
  console.log(`  - Rule-based detected:  ${ruleAntiBlackRacism}`);
  console.log(`  - AI detected:          ${aiAntiBlackRacism}`);
  console.log('='.repeat(60));

  // Show recent cases with AI
  console.log('\nRECENT CASES WITH AI CLASSIFICATION:');
  const recentAI = data.filter(c => c.ai_classification).slice(0, 5);
  recentAI.forEach((c, idx) => {
    console.log(`\n${idx + 1}. ${c.case_title}`);
    console.log(`   Rule: ${c.rule_based_classification?.category} (${c.rule_based_classification?.confidence})`);
    console.log(`   AI:   ${c.ai_classification?.category} (${c.ai_classification?.confidence})`);
    console.log(`   Combined: ${c.combined_confidence} | Review: ${c.needs_review ? 'YES' : 'NO'}`);
    if (c.ai_classification?.reasoning) {
      console.log(`   Reasoning: ${c.ai_classification.reasoning.substring(0, 80)}...`);
    }
  });
}

analyzeAIUsage().catch(console.error);
