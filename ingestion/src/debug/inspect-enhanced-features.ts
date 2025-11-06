/**
 * Demo Enhanced Features Inspector
 * 
 * This script demonstrates the new advanced features of the demo data generator:
 * - Intersectional discrimination cases
 * - Settlement and mediation outcomes
 * - Partial success cases
 * - French language decisions (Quebec)
 */

import { generateDemoDataset } from '../demo/generator';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🎯 ENHANCED DEMO DATA FEATURES DEMONSTRATION');
console.log('═══════════════════════════════════════════════════════════════\n');

// ============================================================================
// Feature 1: Intersectional Discrimination Cases
// ============================================================================
console.log('📍 FEATURE 1: Intersectional Discrimination Cases');
console.log('─────────────────────────────────────────────────────────────\n');

const intersectionalDataset = generateDemoDataset('canlii_hrto', 10, 1.0, {
  includeIntersectional: true,
  includeSettlements: false,
  includePartialSuccess: false,
});

let intersectionalCount = 0;
intersectionalDataset.forEach((item, idx) => {
  const hasIntersectional = item.content.fullText.includes('intersectional') || 
                            item.content.fullText.includes('compounded discrimination');
  if (hasIntersectional) {
    intersectionalCount++;
    console.log(`✓ Case ${idx + 1}: ${item.content.caseTitle}`);
    console.log(`  Contains intersectional discrimination references`);
    
    // Extract ground mentions
    const disabilities = item.content.fullText.match(/disability/gi)?.length || 0;
    const sex = item.content.fullText.match(/\bsex\b|\bgender\b/gi)?.length || 0;
    const age = item.content.fullText.match(/\bage\b/gi)?.length || 0;
    
    if (disabilities > 0) console.log(`  - Race + Disability (${disabilities} mentions)`);
    if (sex > 0) console.log(`  - Race + Sex/Gender (${sex} mentions)`);
    if (age > 0) console.log(`  - Race + Age (${age} mentions)`);
    console.log();
  }
});

console.log(`Total intersectional cases: ${intersectionalCount} out of 10\n`);

// ============================================================================
// Feature 2: Settlement and Mediation Outcomes
// ============================================================================
console.log('📍 FEATURE 2: Settlement and Mediation Outcomes');
console.log('─────────────────────────────────────────────────────────────\n');

const settlementDataset = generateDemoDataset('canlii_chrt', 20, 1.0, {
  includeIntersectional: false,
  includeSettlements: true,
  includePartialSuccess: false,
});

const outcomeTypes = {
  settlement: 0,
  mediation: 0,
  consent_order: 0,
  decision: 0,
};

settlementDataset.forEach((item, idx) => {
  const content = item.content.fullText;
  
  if (content.includes('MINUTES OF SETTLEMENT')) {
    outcomeTypes.settlement++;
    console.log(`✓ Case ${idx + 1}: ${item.content.caseTitle}`);
    console.log(`  Type: Settlement Agreement`);
    console.log(`  Document Type: ${item.content.documentType}`);
  } else if (content.includes('MEDIATION AGREEMENT')) {
    outcomeTypes.mediation++;
    console.log(`✓ Case ${idx + 1}: ${item.content.caseTitle}`);
    console.log(`  Type: Mediation Agreement`);
    console.log(`  Document Type: ${item.content.documentType}`);
  } else if (content.includes('CONSENT ORDER')) {
    outcomeTypes.consent_order++;
    console.log(`✓ Case ${idx + 1}: ${item.content.caseTitle}`);
    console.log(`  Type: Consent Order`);
    console.log(`  Document Type: ${item.content.documentType}`);
  } else if (content.includes('# DECISION')) {
    outcomeTypes.decision++;
  }
});

console.log(`\nOutcome Distribution:`);
console.log(`  Settlements: ${outcomeTypes.settlement}`);
console.log(`  Mediations: ${outcomeTypes.mediation}`);
console.log(`  Consent Orders: ${outcomeTypes.consent_order}`);
console.log(`  Decisions: ${outcomeTypes.decision}`);
console.log();

// ============================================================================
// Feature 3: Partial Success Cases
// ============================================================================
console.log('📍 FEATURE 3: Partial Success Cases (Mixed Remedies)');
console.log('─────────────────────────────────────────────────────────────\n');

const partialSuccessDataset = generateDemoDataset('canlii_bchrt', 15, 1.0, {
  includeIntersectional: false,
  includeSettlements: false,
  includePartialSuccess: true,
});

let partialSuccessCount = 0;
partialSuccessDataset.forEach((item, idx) => {
  const content = item.content.fullText;
  const hasPartialSuccess = content.includes('allowed in part') || 
                           content.includes('mixed findings') ||
                           content.includes('some of the alleged incidents were not proven') ||
                           content.includes('$18,000') || // Reduced dignity damages
                           content.includes('$28,000'); // Reduced lost wages
  
  if (hasPartialSuccess) {
    partialSuccessCount++;
    console.log(`✓ Case ${idx + 1}: ${item.content.caseTitle}`);
    console.log(`  Mixed outcome with partial findings`);
    
    // Extract remedy amounts
    const dignityMatch = content.match(/\$(\d{1,3}(?:,\d{3})*) in damages for injury to dignity/);
    const wagesMatch = content.match(/\$(\d{1,3}(?:,\d{3})*) for lost wages/);
    
    if (dignityMatch) console.log(`  - Dignity damages: $${dignityMatch[1]}`);
    if (wagesMatch) console.log(`  - Lost wages: $${wagesMatch[1]}`);
    console.log();
  }
});

console.log(`Total partial success cases: ${partialSuccessCount} out of 15\n`);

// ============================================================================
// Feature 4: French Language Decisions (Quebec)
// ============================================================================
console.log('📍 FEATURE 4: French Language Decisions (Quebec)');
console.log('─────────────────────────────────────────────────────────────\n');

const frenchDataset = generateDemoDataset('canlii_qctdp', 5, 1.0, {
  language: 'fr',
});

frenchDataset.forEach((item, idx) => {
  console.log(`✓ Cas ${idx + 1}: ${item.content.caseTitle}`);
  console.log(`  Langue: ${item.content.language}`);
  console.log(`  Tribunal: ${item.content.tribunal}`);
  console.log(`  Province: ${item.content.province}`);
  
  // Check for French legal terms
  const content = item.content.fullText;
  const frenchTerms = {
    'Noir/Noire': (content.match(/\bNoir\b|\bNoire\b/gi) || []).length,
    'personne noire': (content.match(/personne noire/gi) || []).length,
    'origine africaine': (content.match(/origine africaine/gi) || []).length,
    'discrimination': (content.match(/discrimination/gi) || []).length,
    'racisme': (content.match(/racisme/gi) || []).length,
    'plaignant': (content.match(/plaignant/gi) || []).length,
    'défendeur': (content.match(/défendeur/gi) || []).length,
    'dommages moraux': (content.match(/dommages moraux/gi) || []).length,
  };
  
  console.log(`  Termes français détectés:`);
  Object.entries(frenchTerms).forEach(([term, count]) => {
    if (count > 0) {
      console.log(`    - "${term}": ${count} mentions`);
    }
  });
  console.log();
});

// ============================================================================
// Feature 5: Combined Advanced Features
// ============================================================================
console.log('📍 FEATURE 5: Combined Advanced Features (All Together)');
console.log('─────────────────────────────────────────────────────────────\n');

const combinedDataset = generateDemoDataset('canlii_hrto', 30, 0.8, {
  includeIntersectional: true,
  includeSettlements: true,
  includePartialSuccess: true,
});

const stats = {
  antiBlackRacism: 0,
  intersectional: 0,
  settlements: 0,
  partialSuccess: 0,
  decisions: 0,
  averageLength: 0,
  totalKeywords: 0,
};

combinedDataset.forEach((item) => {
  if (item.hasAntiBlackRacism) {
    stats.antiBlackRacism++;
  }
  
  const content = item.content.fullText;
  stats.averageLength += content.length;
  
  if (content.includes('intersectional') || content.includes('compounded discrimination')) {
    stats.intersectional++;
  }
  
  if (content.includes('MINUTES OF SETTLEMENT') || content.includes('MEDIATION AGREEMENT') || content.includes('CONSENT ORDER')) {
    stats.settlements++;
  } else if (content.includes('# DECISION')) {
    stats.decisions++;
  }
  
  if (content.includes('allowed in part') || content.includes('mixed findings') || content.includes('$18,000') || content.includes('$28,000')) {
    stats.partialSuccess++;
  }
  
  // Count discrimination keywords
  const keywords = ['Black', 'African', 'anti-Black', 'racism', 'racial', 'discrimination'];
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    stats.totalKeywords += (content.match(regex) || []).length;
  });
});

stats.averageLength = Math.round(stats.averageLength / combinedDataset.length);

console.log('Combined Dataset Statistics (30 cases):');
console.log(`  Anti-Black racism cases: ${stats.antiBlackRacism} (${Math.round(stats.antiBlackRacism/30*100)}%)`);
console.log(`  Intersectional cases: ${stats.intersectional}`);
console.log(`  Settlements/mediations: ${stats.settlements}`);
console.log(`  Partial success: ${stats.partialSuccess}`);
console.log(`  Traditional decisions: ${stats.decisions}`);
console.log(`  Average document length: ${stats.averageLength.toLocaleString()} characters`);
console.log(`  Total discrimination keywords: ${stats.totalKeywords}`);
console.log(`  Average keywords per case: ${Math.round(stats.totalKeywords / combinedDataset.length)}`);
console.log();

// ============================================================================
// Classification Accuracy Check
// ============================================================================
async function runClassificationTest() {
  console.log('📍 CLASSIFICATION ACCURACY VERIFICATION');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { CombinedClassifier } = await import('../classifiers/combined');
  const classifier = new CombinedClassifier();

  const testDataset = generateDemoDataset('canlii_hrto', 20, 0.5, {
    includeIntersectional: true,
    includeSettlements: true,
    includePartialSuccess: true,
  });

  let correct = 0;
  let total = testDataset.length;

  for (let idx = 0; idx < testDataset.length; idx++) {
    const item = testDataset[idx];
    const classification = await classifier.classify(item.content);
    const isAntiBlack = classification.finalCategory === 'anti_black_racism';
    const expected = item.hasAntiBlackRacism;
    
    if (isAntiBlack === expected) {
      correct++;
    } else {
      console.log(`❌ Misclassification on case ${idx + 1}:`);
      console.log(`   Expected: ${expected ? 'YES' : 'NO'}, Got: ${isAntiBlack ? 'YES' : 'NO'}`);
      console.log(`   Case: ${item.content.caseTitle}`);
      console.log(`   Type: ${item.content.documentType}`);
    }
  }

  const accuracy = (correct / total * 100).toFixed(1);
  console.log(`\nClassification Accuracy: ${correct}/${total} (${accuracy}%)`);

  if (accuracy === '100.0') {
    console.log('✅ Perfect classification maintained with enhanced features!');
  } else {
    console.log(`⚠️  Some misclassifications detected. Review needed.`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ Enhanced Features Demonstration Complete');
  console.log('═══════════════════════════════════════════════════════════════');
}

// Run the classification test
runClassificationTest().catch(console.error);
