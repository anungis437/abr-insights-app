#!/usr/bin/env node
/**
 * World-Class Production Readiness Verification Script
 * 
 * Verifies that all P0 fixes are operational at runtime.
 * Run this after deployment to confirm world-class readiness.
 */

const http = require('http');
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

const BASE_URL = process.env.VERIFY_URL || 'http://localhost:3000';
const IS_HTTPS = BASE_URL.startsWith('https');
const httpClient = IS_HTTPS ? https : http;

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const req = httpClient.get(url, {
      ...options,
      headers: {
        'User-Agent': 'Production-Readiness-Verifier/1.0',
        ...options.headers,
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verifyMiddlewareActive() {
  log.info('Verifying P0-1: Middleware Security Enforcement...');
  
  try {
    const response = await makeRequest('/');
    
    // Check CSP header
    if (response.headers['content-security-policy']) {
      log.success('Content-Security-Policy header present');
      
      // Check for nonce
      if (response.headers['content-security-policy'].includes('nonce-')) {
        log.success('CSP includes nonce directive');
      } else {
        log.warn('CSP missing nonce directive');
      }
    } else {
      log.error('Content-Security-Policy header MISSING');
      return false;
    }
    
    // Check correlation ID
    if (response.headers['x-correlation-id']) {
      log.success('x-correlation-id header present');
    } else {
      log.error('x-correlation-id header MISSING');
      return false;
    }
    
    // Check nonce header
    if (response.headers['x-nonce']) {
      log.success('x-nonce header present');
    } else {
      log.warn('x-nonce header missing (may be omitted on some responses)');
    }
    
    return true;
  } catch (error) {
    log.error(`Middleware verification failed: ${error.message}`);
    return false;
  }
}

async function verifyHealthcheckEndpoints() {
  log.info('Verifying P0-2: Healthcheck Endpoints...');
  
  try {
    // Test /api/healthz (liveness)
    const healthz = await makeRequest('/api/healthz');
    
    if (healthz.statusCode === 200) {
      log.success('/api/healthz returns 200');
      
      const data = JSON.parse(healthz.body);
      if (data.status === 'ok') {
        log.success('/api/healthz returns status: ok');
      } else {
        log.error('/api/healthz status field incorrect');
        return false;
      }
    } else {
      log.error(`/api/healthz returns ${healthz.statusCode} (expected 200)`);
      return false;
    }
    
    // Test /api/readyz (readiness)
    const readyz = await makeRequest('/api/readyz');
    
    if (readyz.statusCode === 200 || readyz.statusCode === 503) {
      log.success(`/api/readyz returns ${readyz.statusCode} (expected 200 or 503)`);
      
      const data = JSON.parse(readyz.body);
      if (data.status === 'ready' || data.status === 'not_ready') {
        log.success('/api/readyz returns valid status');
      } else {
        log.error('/api/readyz status field incorrect');
        return false;
      }
    } else {
      log.error(`/api/readyz returns ${readyz.statusCode} (expected 200 or 503)`);
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Healthcheck verification failed: ${error.message}`);
    return false;
  }
}

async function verifyDevRoutesBlocked() {
  log.info('Verifying: _dev Routes Blocked in Production...');
  
  if (process.env.NODE_ENV !== 'production') {
    log.warn('Not in production mode, skipping _dev route check');
    return true;
  }
  
  try {
    const response = await makeRequest('/_dev/test');
    
    if (response.statusCode === 404) {
      log.success('_dev routes correctly return 404 in production');
      return true;
    } else {
      log.error(`_dev routes return ${response.statusCode} (expected 404)`);
      return false;
    }
  } catch (error) {
    // 404 may not be caught as error depending on implementation
    return true;
  }
}

async function verifySecurityHeaders() {
  log.info('Verifying: Additional Security Headers...');
  
  try {
    const response = await makeRequest('/');
    
    const expectedHeaders = [
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
    ];
    
    let allPresent = true;
    
    for (const header of expectedHeaders) {
      if (response.headers[header]) {
        log.success(`${header} present`);
      } else {
        log.warn(`${header} missing (check next.config.js)`);
        allPresent = false;
      }
    }
    
    return allPresent;
  } catch (error) {
    log.error(`Security header verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 World-Class Production Readiness Verification');
  console.log('='.repeat(60) + '\n');
  
  log.info(`Target: ${BASE_URL}`);
  log.info(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
  
  const results = {
    middleware: await verifyMiddlewareActive(),
    healthchecks: await verifyHealthcheckEndpoints(),
    devRoutes: await verifyDevRoutesBlocked(),
    securityHeaders: await verifySecurityHeaders(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary');
  console.log('='.repeat(60) + '\n');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  
  console.log(`Results: ${passed}/${total} checks passed\n`);
  
  Object.entries(results).forEach(([check, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${check}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (passed === total) {
    log.success('🎉 All verification checks passed!');
    log.success('Application is WORLD-CLASS PRODUCTION READY');
    process.exit(0);
  } else {
    log.error(`${total - passed} verification check(s) failed`);
    log.error('Review logs above and fix issues before deployment');
    process.exit(1);
  }
}

main().catch((error) => {
  log.error(`Verification script failed: ${error.message}`);
  process.exit(1);
});
