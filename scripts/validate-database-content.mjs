#!/usr/bin/env node
/**
 * Validate Ingested Database Content
 * 
 * This script checks the quality and completeness of ingested tribunal cases
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

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 DATABASE CONTENT VALIDATION');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Get total counts
  console.log('📈 Total Records\n');
  
  const { count: rawCount, error: rawError } = await supabase
    .from('tribunal_cases_raw')
    .select('*', { count: 'exact', head: true });
  
  if (rawError) {
    console.error('❌ Error counting raw cases:', rawError.message);
    return;
  }
  
  console.log(`   tribunal_cases_raw: ${rawCount?.toLocaleString() || 0} records`);
  
  const { count: prodCount } = await supabase
    .from('tribunal_cases')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   tribunal_cases:     ${prodCount?.toLocaleString() || 0} records\n`);

  // 2. Get source breakdown
  console.log('📋 By Source System\n');
  
  const { data: sources } = await supabase
    .from('tribunal_cases_raw')
    .select('source_system')
    .order('source_system');
  
  if (sources) {
    const sourceCounts = sources.reduce((acc, row) => {
      acc[row.source_system] = (acc[row.source_system] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`   ${source.padEnd(20)} ${count.toLocaleString()} cases`);
      });
  }
  console.log('');

  // 3. Check data quality
  console.log('✅ Data Quality Checks\n');
  
  const { data: cases } = await supabase
    .from('tribunal_cases_raw')
    .select('case_number, case_title, citation, decision_date, combined_confidence, promotion_status')
    .limit(1000);
  
  if (cases) {
    const withCaseNumber = cases.filter(c => c.case_number).length;
    const withTitle = cases.filter(c => c.case_title).length;
    const withCitation = cases.filter(c => c.citation).length;
    const withDecisionDate = cases.filter(c => c.decision_date).length;
    const withConfidence = cases.filter(c => c.combined_confidence !== null).length;
    
    const total = cases.length;
    console.log(`   Case Number:     ${withCaseNumber.toLocaleString().padStart(5)} / ${total} (${((withCaseNumber/total)*100).toFixed(1)}%)`);
    console.log(`   Case Title:      ${withTitle.toLocaleString().padStart(5)} / ${total} (${((withTitle/total)*100).toFixed(1)}%)`);
    console.log(`   Citation:        ${withCitation.toLocaleString().padStart(5)} / ${total} (${((withCitation/total)*100).toFixed(1)}%)`);
    console.log(`   Decision Date:   ${withDecisionDate.toLocaleString().padStart(5)} / ${total} (${((withDecisionDate/total)*100).toFixed(1)}%)`);
    console.log(`   Confidence:      ${withConfidence.toLocaleString().padStart(5)} / ${total} (${((withConfidence/total)*100).toFixed(1)}%)`);
  }
  console.log('');

  // 4. Promotion status
  console.log('🔄 Promotion Status\n');
  
  const { data: statuses } = await supabase
    .from('tribunal_cases_raw')
    .select('promotion_status');
  
  if (statuses) {
    const statusCounts = statuses.reduce((acc, row) => {
      acc[row.promotion_status] = (acc[row.promotion_status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        const icon = status === 'pending' ? '⏳' : 
                     status === 'approved' ? '✅' : 
                     status === 'promoted' ? '🎉' : 
                     status === 'rejected' ? '❌' : '📝';
        console.log(`   ${icon} ${status.padEnd(15)} ${count.toLocaleString()} cases`);
      });
  }
  console.log('');

  // 5. Recent cases
  console.log('📅 Recent Ingestions\n');
  
  const { data: recent } = await supabase
    .from('tribunal_cases_raw')
    .select('case_title, source_url, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (recent) {
    recent.forEach((c, i) => {
      const date = new Date(c.created_at);
      const timeAgo = getTimeAgo(date);
      console.log(`   ${i + 1}. ${c.case_title?.substring(0, 50)}...`);
      console.log(`      ${timeAgo} | ${c.source_url}`);
    });
  }
  console.log('');

  // 6. Check for failed ingestions (cases with issues)
  console.log('⚠️  Potential Issues\n');
  
  const { data: longCaseNumbers } = await supabase
    .from('tribunal_cases_raw')
    .select('case_number, source_url')
    .not('case_number', 'is', null)
    .limit(1000);
  
  if (longCaseNumbers) {
    const veryLong = longCaseNumbers.filter(c => c.case_number && c.case_number.length > 100);
    if (veryLong.length > 0) {
      console.log(`   ⚠️  ${veryLong.length} cases with case_number > 100 chars (need VARCHAR increase)`);
      console.log(`   Example: "${veryLong[0].case_number.substring(0, 80)}..."`);
    } else {
      console.log(`   ✅ All case_number fields within 100 character limit`);
    }
  }
  
  const { data: missingTitles } = await supabase
    .from('tribunal_cases_raw')
    .select('id')
    .is('case_title', null)
    .limit(1, { count: 'exact', head: true });
  
  if (missingTitles) {
    console.log(`   ℹ️  Cases with missing titles: Check data completeness`);
  }
  
  console.log('');

  // 7. Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ VALIDATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log(`Total Cases Ingested: ${rawCount?.toLocaleString() || 0}`);
  console.log(`Awaiting Review: ${statuses?.filter(s => s.promotion_status === 'pending').length || 0}`);
  console.log(`Ready for Production: ${prodCount?.toLocaleString() || 0}\n`);
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

main().catch(console.error);
