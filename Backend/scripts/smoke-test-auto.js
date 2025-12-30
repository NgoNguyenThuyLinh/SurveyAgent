#!/usr/bin/env node

/**
 * Automated Smoke Test Suite
 * Tests: Login → Token → CRUD Template → Survey Lifecycle → Public Response
 * Run: node scripts/smoke-test-auto.js
 */

const axios = require('axios');
const logger = console;

const API_BASE = process.env.API_URL || 'http://localhost:5000/api/modules';
let authToken = '';
let createdIds = {
  template: null,
  question: null,
  survey: null,
  collector: null,
  collectorToken: null
};

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Test helper
 */
async function runTest(name, testFn) {
  try {
    logger.info(`\n Testing: ${name}...`);
    await testFn();
    logger.info(` PASS: ${name}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS' });
  } catch (error) {
    logger.error(` FAIL: ${name}`);
    logger.error(`   Error: ${error.message}`);
    if (error.response?.data) {
      logger.error(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
  }
}

/**
 * Phase 1: Health Check
 */
async function testHealthCheck() {
  await runTest('Health Check Endpoint', async () => {
    const response = await axios.get(`${API_BASE}/health`);
    if (!response.data.ok) throw new Error('Health check failed');
    if (!response.data.db) throw new Error('Database not connected');
    logger.info(`   DB connected: ${response.data.db}, Tables: ${response.data.dbDetails?.tables}`);
  });
}

/**
 * Phase 2: Authentication
 */
async function testLogin() {
  await runTest('User Login', async () => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'creator@example.com',
      password: 'test123'
    });
    
    if (!response.data.data?.token) {
      throw new Error('No token returned');
    }
    
    authToken = response.data.data.token;
    logger.info(`   Token received: ${authToken.substring(0, 20)}...`);
  });
}

async function testGetProfile() {
  await runTest('Get User Profile', async () => {
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.data?.user) {
      throw new Error('No user data returned');
    }
    
    logger.info(`   User: ${response.data.data.user.username} (${response.data.data.user.role})`);
  });
}

/**
 * Phase 3: Template CRUD
 */
async function testCreateTemplate() {
  await runTest('Create Template', async () => {
    const response = await axios.post(`${API_BASE}/templates`, {
      title: 'Smoke Test Template',
      description: 'Automated smoke test template',
      category: 'Testing'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.data?.template_id) {
      throw new Error('No template_id returned');
    }
    
    createdIds.template = response.data.data.template_id;
    logger.info(`   Template ID: ${createdIds.template}`);
  });
}

async function testAddQuestion() {
  await runTest('Add Question to Template', async () => {
    const response = await axios.post(
      `${API_BASE}/templates/${createdIds.template}/questions`,
      {
        question_text: 'How would you rate this smoke test?',
        question_type_id: 4, // rating type
        required: true,
        order: 1
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (!response.data.data?.question_id) {
      throw new Error('No question_id returned');
    }
    
    createdIds.question = response.data.data.question_id;
    logger.info(`   Question ID: ${createdIds.question}`);
  });
}

async function testGetTemplate() {
  await runTest('Get Template Details', async () => {
    const response = await axios.get(`${API_BASE}/templates/${createdIds.template}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.data?.template_id) {
      throw new Error('Template not found');
    }
    
    logger.info(`   Template: ${response.data.data.title}`);
  });
}

async function testTemplateWithQuestions() {
  await runTest('Verify Template Has Questions', async () => {
    const response = await axios.get(`${API_BASE}/templates/${createdIds.template}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const template = response.data.data.template; // Get nested template object
    if (!template.Questions || !Array.isArray(template.Questions)) {
      throw new Error('Questions array not found in template');
    }
    
    if (template.Questions.length === 0) {
      throw new Error('No questions found in template (expected at least 1)');
    }
    
    const question = template.Questions[0];
    if (!question.question_text) {
      throw new Error('Question missing question_text field');
    }
    
    logger.info(`   Questions found: ${template.Questions.length}`);
    logger.info(`   First question: "${question.question_text}"`);
  });
}

/**
 * Phase 4: Survey Lifecycle
 */
async function testCreateSurvey() {
  await runTest('Create Survey', async () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const response = await axios.post(`${API_BASE}/surveys`, {
      title: 'Smoke Test Survey',
      description: 'Automated testing survey',
      template_id: createdIds.template,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      status: 'draft'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.data?.survey_id) {
      throw new Error('No survey_id returned');
    }
    
    createdIds.survey = response.data.data.survey_id;
    logger.info(`   Survey ID: ${createdIds.survey}`);
  });
}

async function testPublishSurvey() {
  await runTest('Publish Survey', async () => {
    const response = await axios.patch(
      `${API_BASE}/surveys/${createdIds.survey}/status`,
      { status: 'active' },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.data?.status !== 'active') {
      throw new Error('Survey not activated');
    }
    
    logger.info(`   Survey status: ${response.data.data.status}`);
  });
}

async function testCloseSurvey() {
  await runTest('Close Survey', async () => {
    const response = await axios.patch(
      `${API_BASE}/surveys/${createdIds.survey}/status`,
      { status: 'closed' },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.data?.status !== 'closed') {
      throw new Error('Survey not closed');
    }
    
    logger.info(`   Survey status: ${response.data.data.status}`);
  });
}

/**
 * Phase 5: Collector & Public Response
 */
async function testCreateCollector() {
  await runTest('Create Collector', async () => {
    // Reopen survey first
    await axios.patch(
      `${API_BASE}/surveys/${createdIds.survey}/status`,
      { status: 'active' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const response = await axios.post(
      `${API_BASE}/collectors/survey/${createdIds.survey}`,
      {
        type: 'weblink',
        name: 'Smoke Test Collector'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (!response.data.data?.collector_id) {
      throw new Error('No collector_id returned');
    }
    
    createdIds.collector = response.data.data.collector_id;
    createdIds.collectorToken = response.data.data.token;
    logger.info(`   Collector ID: ${createdIds.collector}`);
    logger.info(`   Token: ${createdIds.collectorToken}`);
  });
}

async function testPublicResponseSubmission() {
  await runTest('Submit Public Response', async () => {
    // Note: This will fail if public endpoint doesn't exist
    // That's expected - test will show what needs to be implemented
    try {
      const response = await axios.post(
        `${API_BASE}/responses/public/${createdIds.collectorToken}`,
        {
          answers: [
            {
              question_id: createdIds.question,
              answer_value: '5'
            }
          ]
        }
      );
      
      if (!response.data.data?.response_id) {
        throw new Error('No response_id returned');
      }
      
      logger.info(`   Response ID: ${response.data.data.response_id}`);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Public response endpoint not implemented (expected - needs to be added)');
      }
      throw error;
    }
  });
}

/**
 * Phase 6: Cleanup
 */
async function cleanup() {
  logger.info('\n Cleaning up test data...');
  
  try {
    if (createdIds.survey) {
      await axios.delete(`${API_BASE}/surveys/${createdIds.survey}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      logger.info('    Survey deleted');
    }
    
    if (createdIds.template) {
      await axios.delete(`${API_BASE}/templates/${createdIds.template}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      logger.info('    Template deleted');
    }
  } catch (error) {
    logger.warn('     Cleanup warning:', error.message);
  }
}

/**
 * Main test runner
 */
async function main() {
  logger.info(' Starting Automated Smoke Tests\n');
  logger.info(` API Base URL: ${API_BASE}\n`);
  logger.info('=' .repeat(60));
  
  // Phase 1: Health
  await testHealthCheck();
  
  // Phase 2: Auth
  await testLogin();
  await testGetProfile();
  
  // Phase 3: Template CRUD
  await testCreateTemplate();
  await testAddQuestion();
  await testGetTemplate();
  await testTemplateWithQuestions();
  
  // Phase 4: Survey Lifecycle
  await testCreateSurvey();
  await testPublishSurvey();
  await testCloseSurvey();
  
  // Phase 5: Collector & Public Response
  await testCreateCollector();
  await testPublicResponseSubmission();
  
  // Cleanup
  await cleanup();
  
  // Summary
  logger.info('\n' + '='.repeat(60));
  logger.info(' SMOKE TEST SUMMARY');
  logger.info('='.repeat(60));
  logger.info(` Passed: ${testResults.passed}`);
  logger.info(` Failed: ${testResults.failed}`);
  logger.info(` Total:  ${testResults.tests.length}`);
  
  if (testResults.failed > 0) {
    logger.info('\n Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => logger.info(`   - ${t.name}: ${t.error}`));
  }
  
  logger.info('\n' + '='.repeat(60));
  
  const passRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
  if (passRate >= 90) {
    logger.info(` System is ${passRate}% operational - EXCELLENT!`);
  } else if (passRate >= 70) {
    logger.info(`  System is ${passRate}% operational - NEEDS WORK`);
  } else {
    logger.info(` System is ${passRate}% operational - CRITICAL ISSUES`);
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  main().catch(error => {
    logger.error('\n Fatal error during smoke tests:', error);
    process.exit(1);
  });
}

module.exports = { main, runTest };
