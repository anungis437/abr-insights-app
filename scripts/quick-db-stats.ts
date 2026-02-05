#!/usr/bin/env node
/**
 * Quick Database Stats
 * Uses existing ingestion infrastructure
 */

import { SupabaseStorageService } from '../ingestion/src/storage/supabase-storage.ts';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 DATABASE CONTENT VALIDATION');
  console.log('═══════════════════════════════════════════════════════\n');

  const storage = new SupabaseStorageService();

  try {
    // Query recent cases
    const { data: cases, error } = await storage.client
      .from('tribunal_cases_raw')
      .select('id, case_number, case_title, source_system, promotion_status, created_at, combined_confidence')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (!cases || cases.length === 0) {
      console.log('⚠️  No cases found in database\n');
      return;
    }

    console.log(`📈 Total Records Retrieved: ${cases.length.toLocaleString()}\n`);

    // Source breakdown
    const sourceCounts = {};
    cases.forEach(c => {
      sourceCounts[c.source_system] = (sourceCounts[c.source_system] || 0) + 1;
    });

    console.log('📋 By Source System\n');
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`   ${source.padEnd(20)} ${count.toLocaleString()} cases`);
      });
    console.log('');

    // Data quality
    const withCaseNumber = cases.filter(c => c.case_number).length;
    const withTitle = cases.filter(c => c.case_title).length;
    const withConfidence = cases.filter(c => c.combined_confidence !== null).length;

    console.log('✅ Data Quality (Last 1000 cases)\n');
    console.log(`   Case Number:     ${withCaseNumber.toLocaleString().padStart(4)} / 1000 (${((withCaseNumber/cases.length)*100).toFixed(1)}%)`);
    console.log(`   Case Title:      ${withTitle.toLocaleString().padStart(4)} / 1000 (${((withTitle/cases.length)*100).toFixed(1)}%)`);
    console.log(`   Confidence:      ${withConfidence.toLocaleString().padStart(4)} / 1000 (${((withConfidence/cases.length)*100).toFixed(1)}%)`);
    console.log('');

    // Promotion status
    const statusCounts = {};
    cases.forEach(c => {
      statusCounts[c.promotion_status] = (statusCounts[c.promotion_status] || 0) + 1;
    });

    console.log('🔄 Promotion Status\n');
    Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        const icon = status === 'pending' ? '⏳' : 
                     status === 'approved' ? '✅' : 
                     status === 'promoted' ? '🎉' : 
                     status === 'rejected' ? '❌' : '📝';
        console.log(`   ${icon} ${status.padEnd(15)} ${count.toLocaleString()} cases`);
      });
    console.log('');

    // Recent cases
    console.log('📅 Most Recent Cases\n');
    cases.slice(0, 5).forEach((c, i) => {
      const date = new Date(c.created_at);
      const timeAgo = getTimeAgo(date);
      console.log(`   ${i + 1}. ${(c.case_title || 'Untitled').substring(0, 55)}`);
      console.log(`      ${timeAgo}`);
    });
    console.log('');

    // Check for long case numbers
    const longCaseNumbers = cases.filter(c => c.case_number && c.case_number.length > 100);
    
    console.log('⚠️  Schema Issues\n');
    if (longCaseNumbers.length > 0) {
      console.log(`   ⚠️  ${longCaseNumbers.length} cases with case_number > 100 chars`);
      console.log(`   📋 Migration needed: supabase/migrations/20260205000001_increase_case_number_length.sql`);
      console.log(`   Example: "${longCaseNumbers[0].case_number.substring(0, 70)}..."\n`);
    } else {
      console.log(`   ✅ All case_number fields within current schema limits\n`);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ VALIDATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Total Cases Analyzed: ${cases.length.toLocaleString()}`);
    console.log(`Awaiting Review: ${statusCounts['pending'] || 0}`);
    console.log(`Quality Score: ${((withTitle/cases.length)*100).toFixed(1)}% (based on title completion)\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

main().catch(console.error);
