/**
 * Test Supabase Storage Integration
 * Stores demo cases to verify database schema and connectivity
 */

import { SupabaseStorageService } from '../storage/supabase-storage.js';
import { generateDemoDataset } from '../demo/generator.js';
import { CombinedClassifier } from '../classifiers/combined.js';

async function testStorageIntegration() {
  console.log('🧪 Testing Supabase Storage Integration\n');
  console.log('=' .repeat(70));

  const storage = new SupabaseStorageService();
  const classifier = new CombinedClassifier();

  try {
    // Step 1: Create ingestion job
    console.log('\n📋 Step 1: Creating ingestion job...');
    const jobId = await storage.createJob('canlii_hrto', 'manual', {
      purpose: 'demo_data_test',
      features: ['intersectional', 'settlements', 'partial_success', 'french'],
    });
    console.log(`✅ Job created: ${jobId}`);

    // Step 2: Generate demo dataset with all features
    console.log('\n📊 Step 2: Generating demo dataset (30 cases)...');
    const dataset = generateDemoDataset('canlii_hrto', 30, 0.7, {
      includeIntersectional: true,
      includeSettlements: true,
      includePartialSuccess: true,
    });
    console.log(`✅ Generated ${dataset.length} cases`);
    console.log(`   - Anti-Black racism cases: ${dataset.filter(d => d.hasAntiBlackRacism).length}`);
    console.log(`   - Control cases: ${dataset.filter(d => !d.hasAntiBlackRacism).length}`);

    // Step 3: Classify all cases
    console.log('\n🤖 Step 3: Classifying cases...');
    const classifiedCases = [];
    let correctClassifications = 0;
    let totalCases = 0;

    for (let i = 0; i < dataset.length; i++) {
      const item = dataset[i];
      const classification = await classifier.classify(item.content);
      
      const isAntiBlack = classification.finalCategory === 'anti_black_racism';
      const isCorrect = isAntiBlack === item.hasAntiBlackRacism;
      
      if (isCorrect) correctClassifications++;
      totalCases++;

      classifiedCases.push({
        content: item.content,
        classification,
        sourceSystem: 'canlii_hrto',
        sourceUrl: item.link.url,
        expected: item.hasAntiBlackRacism,
        actual: isAntiBlack,
      });

      if ((i + 1) % 10 === 0) {
        console.log(`   Classified ${i + 1}/${dataset.length} cases...`);
      }
    }

    const accuracy = (correctClassifications / totalCases) * 100;
    console.log(`✅ Classification complete`);
    console.log(`   Accuracy: ${correctClassifications}/${totalCases} (${accuracy.toFixed(1)}%)`);

    // Step 4: Store cases in batch
    console.log('\n💾 Step 4: Storing cases to Supabase...');
    const storedIds = await storage.storeCasesBatch(
      classifiedCases.map(c => ({
        content: c.content,
        classification: c.classification,
        sourceSystem: c.sourceSystem as any,
        sourceUrl: c.sourceUrl,
      }))
    );
    console.log(`✅ Stored ${storedIds.length} cases`);

    // Step 5: Update job metrics
    console.log('\n📈 Step 5: Updating job metrics...');
    const antiBlackCount = classifiedCases.filter(c => 
      c.classification.finalCategory === 'anti_black_racism'
    ).length;
    const avgConfidence = classifiedCases.reduce((sum, c) => 
      sum + c.classification.finalConfidence, 0
    ) / classifiedCases.length;
    const highConfCount = classifiedCases.filter(c => c.classification.finalConfidence >= 0.8).length;
    const medConfCount = classifiedCases.filter(c => 
      c.classification.finalConfidence >= 0.5 && c.classification.finalConfidence < 0.8
    ).length;
    const lowConfCount = classifiedCases.filter(c => c.classification.finalConfidence < 0.5).length;

    await storage.updateJobMetrics(jobId, {
      cases_discovered: dataset.length,
      cases_fetched: dataset.length,
      cases_classified: classifiedCases.length,
      cases_stored: storedIds.length,
      cases_failed: dataset.length - storedIds.length,
      avg_confidence_score: avgConfidence,
      high_confidence_count: highConfCount,
      medium_confidence_count: medConfCount,
      low_confidence_count: lowConfCount,
    });
    console.log(`✅ Job metrics updated`);

    // Step 6: Complete job
    console.log('\n✅ Step 6: Completing job...');
    await storage.completeJob(jobId, 'completed');
    console.log(`✅ Job completed successfully`);

    // Step 7: Get storage stats
    console.log('\n📊 Step 7: Fetching storage statistics...');
    const stats = await storage.getStats();
    console.log(`✅ Storage Statistics:`);
    console.log(`   Total cases stored: ${stats.totalStored}`);
    console.log(`   Anti-Black racism: ${stats.antiBlackCount}`);
    console.log(`   Other discrimination: ${stats.otherCount}`);
    console.log(`   Average confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
    console.log(`   High confidence (≥80%): ${stats.highConfidenceCount}`);
    console.log(`   Medium confidence (50-79%): ${stats.mediumConfidenceCount}`);
    console.log(`   Low confidence (<50%): ${stats.lowConfidenceCount}`);

    // Step 8: Get cases for review
    console.log('\n🔍 Step 8: Fetching cases needing review...');
    const reviewCases = await storage.getCasesForReview(5);
    console.log(`✅ Found ${reviewCases.length} cases needing review:`);
    
    for (let i = 0; i < Math.min(5, reviewCases.length); i++) {
      const reviewCase = reviewCases[i];
      console.log(`\n   Case ${i + 1}:`);
      console.log(`   - Title: ${reviewCase.case_title?.substring(0, 60) || 'Untitled'}...`);
      console.log(`   - Confidence: ${(reviewCase.combined_confidence * 100).toFixed(1)}%`);
      console.log(`   - Classification: ${(reviewCase.ai_classification as any)?.category || 'unknown'}`);
      console.log(`   - Source: ${reviewCase.source_system}`);
    }

    // Step 9: Feature breakdown
    console.log('\n\n📋 Step 9: Feature Breakdown of Stored Cases...');
    
    // Detect intersectional cases
    const intersectionalCases = classifiedCases.filter(c => {
      const text = c.content.fullText.toLowerCase();
      return text.includes('intersectional') ||
             (text.includes('disability') && text.includes('black')) ||
             (text.includes('sex') && text.includes('black')) ||
             (text.includes('gender') && text.includes('black'));
    });
    console.log(`   Intersectional cases: ${intersectionalCases.length}`);

    // Detect settlements
    const settlementCases = classifiedCases.filter(c => {
      const text = c.content.fullText;
      return text.includes('MINUTES OF SETTLEMENT') ||
             text.includes('MEDIATION AGREEMENT') ||
             text.includes('CONSENT ORDER');
    });
    console.log(`   Settlement/mediation cases: ${settlementCases.length}`);

    // Detect partial success
    const partialSuccessCases = classifiedCases.filter(c => {
      const text = c.content.fullText.toLowerCase();
      return text.includes('allowed in part') ||
             text.includes('mixed findings') ||
             text.includes('some incidents not proven');
    });
    console.log(`   Partial success cases: ${partialSuccessCases.length}`);

    // Document types
    const documentTypes: Record<string, number> = {};
    classifiedCases.forEach(c => {
      const type = c.content.documentType || 'decision';
      documentTypes[type] = (documentTypes[type] || 0) + 1;
    });
    console.log(`   Document types:`);
    Object.entries(documentTypes).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ Storage integration test completed successfully!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Storage integration test failed:', error);
    throw error;
  } finally {
    await storage.close();
  }
}

// Run the test
testStorageIntegration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
