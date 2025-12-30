#!/usr/bin/env node

/**
 * Final System Verification & Checklist
 * Validates all requirements before declaring system ready
 * Run: node scripts/final-checklist.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const logger = console;

/**
 * Simple HTTP request helper
 */
function httpRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 5000,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const BACKEND_ROOT = path.join(__dirname, '..');
const FRONTEND_ROOT = path.join(BACKEND_ROOT, '..', 'Frontend');
const API_BASE = process.env.API_URL || 'http://localhost:5000/api/modules';

const checklist = {
  envValidation: { status: '', details: [] },
  apiPaths: { status: '', details: [] },
  seedAccounts: { status: '', details: [] },
  smokeTests: { status: '', details: [] },
  cors: { status: '', details: [] },
  health: { status: '', details: [] }
};

/**
 * 1 Validate Environment Variables
 */
async function checkEnvValidation() {
  logger.info('\n1  Checking Environment Configuration...');
  
  const backendEnvPath = path.join(BACKEND_ROOT, '.env');
  const frontendEnvPath = path.join(FRONTEND_ROOT, '.env');
  
  const requiredBackend = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET', 'FRONTEND_URL', 'PORT'];
  const requiredFrontend = ['REACT_APP_API_URL'];
  
  let allGood = true;
  
  // Check backend .env
  if (!fs.existsSync(backendEnvPath)) {
    checklist.envValidation.details.push(' Backend .env file not found');
    allGood = false;
  } else {
    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    requiredBackend.forEach(key => {
      const regex = new RegExp(`^${key}=.+`, 'm');
      if (regex.test(envContent)) {
        checklist.envValidation.details.push(` Backend ${key} configured`);
      } else {
        checklist.envValidation.details.push(`  Backend ${key} missing (will use default)`);
      }
    });
  }
  
  // Check frontend .env
  if (!fs.existsSync(frontendEnvPath)) {
    checklist.envValidation.details.push('  Frontend .env not found (will use default)');
  } else {
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    requiredFrontend.forEach(key => {
      const regex = new RegExp(`^${key}=.+`, 'm');
      if (regex.test(envContent)) {
        checklist.envValidation.details.push(` Frontend ${key} configured`);
        // Verify it points to /api/modules
        if (key === 'REACT_APP_API_URL' && !envContent.includes('/api/modules')) {
          checklist.envValidation.details.push(` Frontend API URL must end with /api/modules`);
          allGood = false;
        }
      } else {
        checklist.envValidation.details.push(` Frontend ${key} missing`);
        allGood = false;
      }
    });
  }
  
  checklist.envValidation.status = allGood ? '' : '';
}

/**
 * 2 Check API Paths
 */
async function checkApiPaths() {
  logger.info('\n2  Checking API Path Configuration...');
  
  const appJsPath = path.join(BACKEND_ROOT, 'src', 'app.js');
  const httpJsPath = path.join(FRONTEND_ROOT, 'src', 'api', 'http.js');
  
  let allGood = true;
  
  // Check backend mounts at /api/modules
  if (fs.existsSync(appJsPath)) {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    if (appContent.includes("app.use('/api/modules'")) {
      checklist.apiPaths.details.push(' Backend mounts at /api/modules');
    } else {
      checklist.apiPaths.details.push(' Backend not mounting at /api/modules');
      allGood = false;
    }
    
    // Check legacy routes are commented out
    if (appContent.includes("app.use('/api/v1/questions'") && !appContent.match(/\/\*[\s\S]*app\.use\(['"]\/api\/v1\/questions/)) {
      checklist.apiPaths.details.push('  Legacy routes still active (should be commented)');
    } else {
      checklist.apiPaths.details.push(' Legacy routes cleaned up');
    }
  }
  
  // Check frontend uses correct base URL
  if (fs.existsSync(httpJsPath)) {
    const httpContent = fs.readFileSync(httpJsPath, 'utf8');
    if (httpContent.includes('/api/modules')) {
      checklist.apiPaths.details.push(' Frontend configured for /api/modules');
    } else {
      checklist.apiPaths.details.push(' Frontend not configured for /api/modules');
      allGood = false;
    }
  }
  
  checklist.apiPaths.status = allGood ? '' : '';
}

/**
 * 3 Check Seed Accounts
 */
async function checkSeedAccounts() {
  logger.info('\n3  Checking Seed Data & Sample Accounts...');
  
  const seedScriptPath = path.join(BACKEND_ROOT, 'scripts', 'seed-demo-data.js');
  
  if (!fs.existsSync(seedScriptPath)) {
    checklist.seedAccounts.details.push(' Seed script not found');
    checklist.seedAccounts.status = '';
    return;
  }
  
  checklist.seedAccounts.details.push(' Seed script exists: seed-demo-data.js');
  
  // Try to verify if accounts exist by attempting login
  try {
    const response = await httpRequest(
      `${API_BASE}/auth/login`,
      'POST',
      { email: 'creator@demo.com', password: 'Demo@1234' }
    );
    
    if (response.status === 200 && response.data.data?.token) {
      checklist.seedAccounts.details.push(' Sample accounts seeded (creator@demo.com works)');
      checklist.seedAccounts.status = '';
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      checklist.seedAccounts.details.push('  Server not running - cannot verify accounts');
      checklist.seedAccounts.details.push('   Run: node scripts/seed-demo-data.js');
    } else {
      checklist.seedAccounts.details.push('  Sample accounts not seeded yet');
      checklist.seedAccounts.details.push('   Run: node scripts/seed-demo-data.js');
    }
    checklist.seedAccounts.status = '';
  }
}

/**
 * 4 Check CORS Configuration
 */
async function checkCorsConfig() {
  logger.info('\n4  Checking CORS Configuration...');
  
  const appJsPath = path.join(BACKEND_ROOT, 'src', 'app.js');
  
  if (fs.existsSync(appJsPath)) {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    if (appContent.includes('process.env.CORS_ORIGIN') || appContent.includes('process.env.FRONTEND_URL')) {
      checklist.cors.details.push(' CORS uses environment variables');
    } else {
      checklist.cors.details.push('  CORS hardcoded (should use env vars)');
    }
    
    if (appContent.includes("exposedHeaders: ['Authorization']")) {
      checklist.cors.details.push(' Authorization header exposed');
    } else {
      checklist.cors.details.push(' Authorization header not exposed');
    }
    
    if (appContent.includes('credentials: true')) {
      checklist.cors.details.push(' Credentials enabled');
    }
    
    checklist.cors.status = '';
  }
}

/**
 * 5 Check Health Endpoint
 */
async function checkHealthEndpoint() {
  logger.info('\n5  Checking Health Endpoint...');
  
  try {
    const response = await httpRequest(`${API_BASE}/health`, 'GET');
    
    if (response.status === 200 && response.data.ok) {
      checklist.health.details.push(' Health endpoint responding');
      
      if (response.data.db) {
        checklist.health.details.push(' Database connected');
      } else {
        checklist.health.details.push(' Database not connected');
      }
      
      if (response.data.version) {
        checklist.health.details.push(` Version: ${response.data.version}`);
      }
      
      if (response.data.dbDetails?.tables !== undefined) {
        checklist.health.details.push(` Database tables: ${response.data.dbDetails.tables}`);
      }
      
      checklist.health.status = response.data.db ? '' : '';
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      checklist.health.details.push(' Server not running');
      checklist.health.details.push('   Run: npm start in Backend/');
    } else {
      checklist.health.details.push(` Health check failed: ${error.message}`);
    }
    checklist.health.status = '';
  }
}

/**
 * 6 Check Smoke Tests
 */
async function checkSmokeTests() {
  logger.info('\n6  Checking Smoke Test Availability...');
  
  const autoTestPath = path.join(BACKEND_ROOT, 'scripts', 'smoke-test-auto.js');
  const manualTestPath = path.join(BACKEND_ROOT, 'scripts', 'smoke-e2e.http');
  
  if (fs.existsSync(autoTestPath)) {
    checklist.smokeTests.details.push(' Automated smoke tests: smoke-test-auto.js');
  } else {
    checklist.smokeTests.details.push(' Automated smoke tests missing');
  }
  
  if (fs.existsSync(manualTestPath)) {
    checklist.smokeTests.details.push(' Manual smoke tests: smoke-e2e.http');
  }
  
  checklist.smokeTests.details.push('   Run: node scripts/smoke-test-auto.js');
  checklist.smokeTests.status = fs.existsSync(autoTestPath) ? '' : '';
}

/**
 * Print Final Report
 */
function printReport() {
  logger.info('\n' + '='.repeat(70));
  logger.info(' FINAL SYSTEM CHECKLIST');
  logger.info('='.repeat(70));
  
  Object.keys(checklist).forEach(key => {
    const item = checklist[key];
    const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    logger.info(`\n${item.status} ${title}`);
    item.details.forEach(detail => logger.info(`   ${detail}`));
  });
  
  logger.info('\n' + '='.repeat(70));
  
  // Overall status
  const allPassed = Object.values(checklist).every(item => item.status === '');
  const hasWarnings = Object.values(checklist).some(item => item.status === '');
  
  if (allPassed) {
    logger.info(' SYSTEM STATUS: FULLY OPERATIONAL');
    logger.info('   All checks passed! System ready for production.');
  } else if (hasWarnings) {
    logger.info('  SYSTEM STATUS: OPERATIONAL WITH WARNINGS');
    logger.info('   System functional but has configuration warnings.');
  } else {
    logger.info(' SYSTEM STATUS: NEEDS ATTENTION');
    logger.info('   Critical issues found. Review checklist above.');
  }
  
  logger.info('\n Next Steps:');
  logger.info('   1. Fix any  issues above');
  logger.info('   2. Run: node scripts/seed-demo-data.js (if not done)');
  logger.info('   3. Run: node scripts/smoke-test-auto.js (verify E2E)');
  logger.info('   4. Start frontend: cd Frontend && npm start');
  logger.info('   5. Test at: http://localhost:3000');
  
  logger.info('\n' + '='.repeat(70) + '\n');
}

/**
 * Main
 */
async function main() {
  logger.info(' Starting Final System Verification...\n');
  
  await checkEnvValidation();
  await checkApiPaths();
  await checkCorsConfig();
  await checkHealthEndpoint();
  await checkSeedAccounts();
  await checkSmokeTests();
  
  printReport();
}

// Run
if (require.main === module) {
  main().catch(error => {
    logger.error('\n Error during verification:', error.message);
    process.exit(1);
  });
}

module.exports = { main };
