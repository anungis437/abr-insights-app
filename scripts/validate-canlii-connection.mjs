#!/usr/bin/env node
/**
 * CanLII API Connection Validator
 * 
 * Tests the CanLII API connection and validates:
 * - API key authentication
 * - Database listing
 * - Rate limiting
 * - Basic case browsing
 * 
 * Usage: node scripts/validate-canlii-connection.mjs
 */

import axios from 'axios'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const API_BASE_URL = 'https://api.canlii.org/v1'
const API_KEY = process.env.CANLII_API_KEY

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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function validateApiKey() {
  logSection('1. API Key Validation')
  
  if (!API_KEY) {
    log('❌ CANLII_API_KEY not found in environment variables', colors.red)
    log('   Add it to your .env file or set as environment variable', colors.yellow)
    return false
  }
  
  log(`✅ API Key found: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`, colors.green)
  return true
}

async function testDatabaseListing() {
  logSection('2. Database Listing Test')
  
  try {
    log('Fetching available case databases...', colors.gray)
    
    const response = await axios.get(`${API_BASE_URL}/caseBrowse/en/`, {
      params: { api_key: API_KEY },
      timeout: 10000,
    })
    
    if (response.status === 200 && response.data?.caseDatabases) {
      const databases = response.data.caseDatabases
      log(`✅ Successfully retrieved ${databases.length} case databases`, colors.green)
      
      // Show some examples
      log('\nSample databases:', colors.cyan)
      databases.slice(0, 5).forEach(db => {
        log(`  - ${db.databaseId.padEnd(15)} | ${db.name}`, colors.gray)
      })
      
      // Look for tribunal databases
      log('\nTribunal databases found:', colors.cyan)
      const tribunals = databases.filter(db => 
        db.name.toLowerCase().includes('tribunal') || 
        db.name.toLowerCase().includes('board')
      )
      
      if (tribunals.length > 0) {
        tribunals.slice(0, 10).forEach(db => {
          log(`  - ${db.databaseId.padEnd(15)} | ${db.name}`, colors.gray)
        })
      } else {
        log('  No tribunal databases found in listing', colors.yellow)
      }
      
      return { success: true, databases }
    } else {
      log('❌ Unexpected response format', colors.red)
      log(`   Status: ${response.status}`, colors.gray)
      return { success: false, databases: [] }
    }
  } catch (error) {
    log('❌ Database listing failed', colors.red)
    
    if (error.response) {
      log(`   HTTP ${error.response.status}: ${error.response.statusText}`, colors.gray)
      if (error.response.status === 401 || error.response.status === 403) {
        log('   This might indicate an invalid API key', colors.yellow)
      }
    } else if (error.code === 'ENOTFOUND') {
      log('   Network error: Could not reach api.canlii.org', colors.gray)
    } else {
      log(`   Error: ${error.message}`, colors.gray)
    }
    
    return { success: false, databases: [] }
  }
}

async function testCaseBrowsing(databaseId = 'onhrt') {
  logSection('3. Case Browsing Test')
  
  try {
    log(`Testing case browsing for database: ${databaseId}`, colors.gray)
    log('Fetching recent cases with pagination...', colors.gray)
    
    // Rate limit: wait 500ms between requests (2 req/sec)
    await sleep(500)
    
    const response = await axios.get(`${API_BASE_URL}/caseBrowse/en/${databaseId}/`, {
      params: { 
        api_key: API_KEY,
        offset: 0,
        resultCount: 5
      },
      timeout: 10000,
    })
    
    if (response.status === 200 && response.data?.cases) {
      const cases = response.data.cases
      log(`✅ Successfully retrieved ${cases.length} cases from ${databaseId}`, colors.green)
      
      if (cases.length > 0) {
        log('\nSample cases:', colors.cyan)
        cases.forEach((c, i) => {
          log(`  ${i + 1}. ${c.title}`, colors.gray)
          log(`     Citation: ${c.citation}`, colors.gray)
          if (c.url) log(`     URL: ${c.url}`, colors.gray)
          console.log()
        })
      }
      
      return { success: true, cases }
    } else {
      log('❌ Unexpected response format', colors.red)
      return { success: false, cases: [] }
    }
  } catch (error) {
    log('❌ Case browsing failed', colors.red)
    
    if (error.response) {
      log(`   HTTP ${error.response.status}: ${error.response.statusText}`, colors.gray)
      if (error.response.status === 404) {
        log(`   Database '${databaseId}' might not exist or has no cases`, colors.yellow)
      }
    } else {
      log(`   Error: ${error.message}`, colors.gray)
    }
    
    return { success: false, cases: [] }
  }
}

async function testRateLimiting() {
  logSection('4. Rate Limiting Test')
  
  log('Testing rate limiting (sending 3 requests rapidly)...', colors.gray)
  
  const startTime = Date.now()
  const results = []
  
  for (let i = 0; i < 3; i++) {
    try {
      const reqStart = Date.now()
      await axios.get(`${API_BASE_URL}/caseBrowse/en/`, {
        params: { api_key: API_KEY },
        timeout: 10000,
      })
      const reqTime = Date.now() - reqStart
      results.push({ success: true, time: reqTime })
      log(`  Request ${i + 1}: ${reqTime}ms`, colors.gray)
    } catch (error) {
      results.push({ success: false, error: error.message })
      log(`  Request ${i + 1}: Failed - ${error.message}`, colors.red)
    }
    
    // Be respectful: 2 req/sec = 500ms between requests
    if (i < 2) await sleep(500)
  }
  
  const totalTime = Date.now() - startTime
  const successCount = results.filter(r => r.success).length
  
  log(`\n✅ Completed ${successCount}/3 requests in ${totalTime}ms`, colors.green)
  log(`   Average time per request: ${Math.round(totalTime / 3)}ms`, colors.gray)
  
  if (totalTime < 1000) {
    log('⚠️  Requests completed quickly - ensure rate limiting is respected', colors.yellow)
  }
  
  return { success: successCount > 0, results }
}

async function generateReport(results) {
  logSection('Validation Report')
  
  const allPassed = Object.values(results).every(r => r.success)
  
  if (allPassed) {
    log('🎉 All tests passed! CanLII API connection is working.', colors.green)
    log('\nYou can now:', colors.cyan)
    log('  - Use the API in your ingestion scripts', colors.gray)
    log('  - Browse case databases programmatically', colors.gray)
    log('  - Fetch case metadata and content', colors.gray)
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', colors.yellow)
  }
  
  console.log()
  log('Configuration:', colors.cyan)
  log(`  API Base URL: ${API_BASE_URL}`, colors.gray)
  log(`  API Key: ${API_KEY ? 'Configured ✓' : 'Missing ✗'}`, colors.gray)
  log(`  Rate Limit: 2 requests/second (500ms between requests)`, colors.gray)
  
  console.log()
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.clear()
  log('\n╔════════════════════════════════════════════════════════╗', colors.cyan)
  log('║       CanLII API Connection Validator                 ║', colors.cyan)
  log('╚════════════════════════════════════════════════════════╝', colors.cyan)
  
  const results = {}
  
  // 1. Validate API key
  results.apiKey = await validateApiKey()
  if (!results.apiKey) {
    log('\n❌ Cannot proceed without API key. Exiting.', colors.red)
    process.exit(1)
  }
  
  // 2. Test database listing
  const dbResult = await testDatabaseListing()
  results.databaseListing = dbResult.success
  
  // 3. Test case browsing (try a known tribunal)
  const caseResult = await testCaseBrowsing('onhrt') // Ontario Human Rights Tribunal
  results.caseBrowsing = caseResult.success
  
  // 4. Test rate limiting
  const rateResult = await testRateLimiting()
  results.rateLimiting = rateResult.success
  
  // Generate final report
  await generateReport(results)
}

// Run validation
main().catch(error => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error.message)
  process.exit(1)
})
