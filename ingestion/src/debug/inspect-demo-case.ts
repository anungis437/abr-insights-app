#!/usr/bin/env tsx
/**
 * Demo Case Inspector
 * 
 * Generates and displays a single demo case to verify content quality
 */

import { generateDemoDataset } from '../demo/generator';

console.log('Generating demo case for inspection...\n');

// Generate one case with anti-Black racism
const dataset = generateDemoDataset('canlii_hrto', 1, 1.0);
const { link, content, hasAntiBlackRacism } = dataset[0];

console.log('═══════════════════════════════════════════════════════');
console.log('CASE METADATA');
console.log('═══════════════════════════════════════════════════════');
console.log('URL:', link.url);
console.log('Title:', link.title);
console.log('Date:', link.date);
console.log('Preview:', link.preview);
console.log('Has Anti-Black Racism Flag:', hasAntiBlackRacism);
console.log('');

console.log('═══════════════════════════════════════════════════════');
console.log('DECISION CONTENT');
console.log('═══════════════════════════════════════════════════════');
console.log('Case Title:', content.caseTitle);
console.log('Citation:', content.citation);
console.log('Tribunal:', content.tribunal);
console.log('Province:', content.province);
console.log('Decision Date:', content.decisionDate);
console.log('Applicant:', content.applicant);
console.log('Respondent:', content.respondent);
console.log('Language:', content.language);
console.log('Document Type:', content.documentType);
console.log('Text Length:', content.textLength, 'characters');
console.log('');

console.log('═══════════════════════════════════════════════════════');
console.log('FULL DECISION TEXT');
console.log('═══════════════════════════════════════════════════════');
console.log(content.fullText);
console.log('');

console.log('═══════════════════════════════════════════════════════');
console.log('KEYWORD CHECK');
console.log('═══════════════════════════════════════════════════════');

const keywords = [
  'Black',
  'African',
  'anti-Black',
  'racism',
  'racial',
  'discrimination',
  'racist',
  'slur',
  'N-word',
];

const text = content.fullText.toLowerCase();
keywords.forEach(keyword => {
  const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
  const matches = content.fullText.match(regex);
  const count = matches ? matches.length : 0;
  const status = count > 0 ? '✓' : '✗';
  console.log(`${status} "${keyword}": ${count} occurrences`);
});
