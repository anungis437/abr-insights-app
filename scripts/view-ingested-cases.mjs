#!/usr/bin/env node
/**
 * View Recent Ingested Cases
 * 
 * Shows the 10 most recently ingested cases from tribunal_cases_raw
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('📋 Recent CanLII Cases\n');
  
  // Get recent cases
  const { data: cases, error } = await supabase
    .from('tribunal_cases_raw')
    .select('id, case_title, source_url, decision_date, created_at, combined_confidence, promotion_status')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (!cases || cases.length === 0) {
    console.log('No cases found.');
    return;
  }
  
  console.log(`Found ${cases.length} recent cases:\n`);
  
  cases.forEach((c, i) => {
    console.log(`${i + 1}. ${c.case_title}`);
    console.log(`   URL: ${c.source_url}`);
    console.log(`   Decision Date: ${c.decision_date || 'N/A'}`);
    console.log(`   Confidence: ${c.combined_confidence ? (c.combined_confidence * 100).toFixed(1) + '%' : 'N/A'}`);
    console.log(`   Status: ${c.promotion_status}`);
    console.log(`   Ingested: ${new Date(c.created_at).toLocaleString()}`);
    console.log('');
  });
  
  // Get stats
  const { data: stats } = await supabase
    .from('tribunal_cases_raw')
    .select('promotion_status, combined_confidence')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  if (stats) {
    console.log('📊 24h Statistics:');
    console.log(`   Total ingested: ${stats.length}`);
    console.log(`   Pending review: ${stats.filter(s => s.promotion_status === 'pending').length}`);
    
    const withConfidence = stats.filter(s => s.combined_confidence);
    if (withConfidence.length > 0) {
      const avgConfidence = withConfidence.reduce((sum, s) => sum + s.combined_confidence, 0) / withConfidence.length;
      console.log(`   Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    }
  }
}

main().catch(console.error);
