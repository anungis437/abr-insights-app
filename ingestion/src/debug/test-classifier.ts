/**
 * Debug script to test classifier with demo data
 */

import { RuleBasedClassifier } from '../classifiers/rule-based';
import { generateDemoDataset } from '../demo/generator';

// Generate one case with anti-Black racism
console.log('Generating demo case with anti-Black racism...\n');
const dataset = generateDemoDataset('canlii_hrto', 1, 1.0);
const { content, hasAntiBlackRacism } = dataset[0];

console.log('Demo Case Details:');
console.log('='.repeat(60));
console.log('Has Anti-Black Flag:', hasAntiBlackRacism);
console.log('Text Length:', content.fullText.length);
console.log('\nFirst 500 characters:');
console.log(content.fullText.substring(0, 500));
console.log('\n' + '='.repeat(60) + '\n');

// Test classifier
console.log('Testing Rule-Based Classifier...\n');
const classifier = new RuleBasedClassifier();
const result = classifier.classify(content);

console.log('Classification Result:');
console.log('='.repeat(60));
console.log('Is Anti-Black Likely:', result.isAntiBlackLikely);
console.log('Is Race Related:', result.isRaceRelated);
console.log('Confidence:', result.confidence);
console.log('\nKeyword Matches:');
console.log('  Race Keywords:', result.keywordMatches.raceKeywords.length, '→', result.keywordMatches.raceKeywords.slice(0, 5));
console.log('  Black Keywords:', result.keywordMatches.blackKeywords.length, '→', result.keywordMatches.blackKeywords.slice(0, 5));
console.log('  Discrimination Keywords:', result.keywordMatches.discriminationKeywords.length, '→', result.keywordMatches.discriminationKeywords.slice(0, 5));
console.log('\nGrounds Detected:', result.groundsDetected);
console.log('\nReasoning:', result.reasoning);
console.log('='.repeat(60) + '\n');

// Check specific keywords in text
console.log('Manual Keyword Check:');
console.log('='.repeat(60));
const lowerText = content.fullText.toLowerCase();
const testKeywords = ['black', 'african', 'racism', 'racial', 'discrimination', 'anti-black'];
testKeywords.forEach(keyword => {
  const found = lowerText.includes(keyword);
  const count = (lowerText.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length;
  console.log(`  "${keyword}": ${found ? '✓ FOUND' : '✗ NOT FOUND'} (${count} occurrences)`);
});
console.log('='.repeat(60));
