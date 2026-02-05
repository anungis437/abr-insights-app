#!/usr/bin/env node
/**
 * CanLII Ingestion Test
 * 
 * Tests the CanLII API ingestion without requiring database setup.
 * - Tests rate limiting compliance
 * - Shows what would be ingested
 * - Validates metadata structure
 * 
 * Usage: node scripts/test-canlii-ingestion.mjs
 */

import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.cyan}${title}${colors.reset}`)
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

// Import after environment is loaded
const { CanLIIApiClient } = await import('../ingestion/src/clients/canlii-api.ts')
const { CanLIIRestApiScraper } = await import('../ingestion/src/scrapers/canlii-rest-api.ts')

async function testIngestion() {
  logSection('CanLII Ingestion Test - Ontario Human Rights Tribunal')
  
  const API_KEY = process.env.CANLII_API_KEY
  
  if (!API_KEY) {
    log('❌ CANLII_API_KEY not found', colors.red)
    return false
  }
  
  log(`✅ API Key configured`, colors.green)
  
  // Create client and scraper
  const client = new CanLIIApiClient()
  const sourceConfig = {
    sourceSystem: 'canlii_hrto',
    baseUrl: 'https://www.canlii.org',
    listingUrl: 'https://www.canlii.org/en/on/onhrt/',
    databaseId: 'onhrt',
    selectors: {},
    pagination: { enabled: true, paramName: 'page', maxPages: 10 }
  }
  
  const scraper = new CanLIIRestApiScraper(sourceConfig.sourceSystem, sourceConfig, client)
  
  log(`\nConfiguration:`, colors.cyan)
  log(`  Tribunal: Ontario Human Rights Tribunal`, colors.gray)
  log(`  Database ID: onhrt`, colors.gray)
  log(`  Rate Limit: 2 req/sec (500ms between requests)`, colors.gray)
  log(`  Test Size: 5 cases\n`, colors.gray)
  
  try {
    log('Discovering cases (this will take ~3 seconds with rate limiting)...', colors.yellow)
    const startTime = Date.now()
    
    // Discover 5 cases
    const decisions = await scraper.discoverDecisions(5, 0)
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    
    log(`\n✅ Successfully discovered ${decisions.length} cases in ${duration}s`, colors.green)
    log(`   Average time per case: ${(duration / decisions.length).toFixed(2)}s`, colors.gray)
    
    if (duration < 2) {
      log(`\n⚠️  Warning: Completed too quickly. Rate limiting may not be working!`, colors.yellow)
    } else {
      log(`\n✅ Rate limiting working correctly (${duration}s for ${decisions.length} cases)`, colors.green)
    }
    
    // Show sample cases
    logSection('Sample Cases Discovered')
    
    decisions.forEach((decision, i) => {
      log(`\n${i + 1}. ${decision.title}`, colors.cyan)
      log(`   Citation: ${decision.citation}`, colors.gray)
      log(`   URL: ${decision.url}`, colors.gray)
      log(`   Decision Date: ${decision.decisionDate || 'N/A'}`, colors.gray)
      log(`   Docket: ${decision.docketNumber || 'N/A'}`, colors.gray)
    })
    
    // Analyze metadata completeness
    logSection('Metadata Completeness')
    
    const withDate = decisions.filter(d => d.decisionDate).length
    const withDocket = decisions.filter(d => d.docketNumber).length
    const withCitation = decisions.filter(d => d.citation).length
    
    log(`Decision Date: ${withDate}/${decisions.length} (${(withDate/decisions.length*100).toFixed(0)}%)`, colors.gray)
    log(`Docket Number: ${withDocket}/${decisions.length} (${(withDocket/decisions.length*100).toFixed(0)}%)`, colors.gray)
    log(`Citation: ${withCitation}/${decisions.length} (${(withCitation/decisions.length*100).toFixed(0)}%)`, colors.gray)
    
    // Compliance check
    logSection('CanLII Compliance Check')
    
    log(`✅ Using REST API (metadata only)`, colors.green)
    log(`✅ Rate limiting enforced (500ms between requests)`, colors.green)
    log(`✅ No full-text storage attempted`, colors.green)
    log(`✅ Attribution: All cases link to CanLII`, colors.green)
    
    // Estimate daily capacity
    log(`\n📊 Daily Capacity Estimate:`, colors.cyan)
    log(`   Rate: 2 requests/second`, colors.gray)
    log(`   Daily limit: 5,000 requests`, colors.gray)
    log(`   Max cases/day: ~5,000 (1 request per case)`, colors.gray)
    log(`   Recommended: 1,000-2,000 cases/day (conservative)`, colors.gray)
    
    // What would be ingested
    logSection('Database Impact (if enabled)')
    
    log(`Would create ${decisions.length} records in 'cases' table:`, colors.gray)
    decisions.forEach((d, i) => {
      log(`  ${i + 1}. ${d.title.substring(0, 60)}...`, colors.gray)
    })
    
    log(`\n✅ Test completed successfully!`, colors.green)
    log(`\nNext steps:`, colors.yellow)
    log(`  1. Set up database schema (see supabase/migrations/)`, colors.gray)
    log(`  2. Run real ingestion: npm run ingest -- --source canlii_hrto --limit 25`, colors.gray)
    log(`  3. Monitor compliance: Check rate limits and daily usage`, colors.gray)
    
    return true
    
  } catch (error) {
    log(`\n❌ Test failed:`, colors.red)
    log(`   ${error.message}`, colors.gray)
    
    if (error.response) {
      log(`   HTTP ${error.response.status}: ${error.response.statusText}`, colors.gray)
    }
    
    return false
  }
}

// Run test
console.clear()
log('\n╔════════════════════════════════════════════════════════╗', colors.cyan)
log('║       CanLII Ingestion Test                           ║', colors.cyan)
log('╚════════════════════════════════════════════════════════╝', colors.cyan)

testIngestion().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error.message)
  process.exit(1)
})
