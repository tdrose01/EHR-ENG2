#!/usr/bin/env node

/**
 * NAVMED 6470/1 Form Testing Script
 * Comprehensive testing for the Navy Radiation Health NAVMED 6470/1 form
 * Tests API endpoints, validation, database integration, and form functionality
 */

// Use built-in fetch for Node.js 18+ or fallback to https
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3005';
const API_BASE = `${BASE_URL}/api/radiation`;

// Test data
const testPersonnel = {
  valid: {
    id: 1,
    edipi: '1234567890',
    rank_rate: 'E5',
    lname: 'Smith',
    fname: 'John',
    unit_id: 1
  }
};

const testReports = {
  validAnnual: {
    report_type: 'ANNUAL',
    personnel_id: 1,
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    calendar_year: 2024,
    deep_dose_msv: 2.5,
    shallow_dose_msv: 15.0,
    extremity_dose_msv: 8.0,
    internal_dose_msv: 0.0,
    prepared_by: 'Test User',
    date_prepared: '2024-12-15',
    rso_signature: 'RSO Signature',
    command_signature: 'Command Signature',
    comments: 'Annual exposure report for 2024'
  },
  
  validSituational: {
    report_type: 'SITUATIONAL',
    personnel_id: 1,
    period_start: '2024-06-01',
    period_end: '2024-06-30',
    calendar_year: 2024,
    deep_dose_msv: 0.8,
    shallow_dose_msv: 3.2,
    extremity_dose_msv: 2.1,
    internal_dose_msv: 0.0,
    prepared_by: 'Test User',
    date_prepared: '2024-07-01',
    comments: 'Transfer report - June 2024'
  },
  
  validOverLimit: {
    report_type: 'OVER_LIMIT',
    personnel_id: 1,
    period_start: '2024-03-01',
    period_end: '2024-03-31',
    calendar_year: 2024,
    deep_dose_msv: 25.0,
    shallow_dose_msv: 50.0,
    extremity_dose_msv: 30.0,
    internal_dose_msv: 0.0,
    limit_exceeded: 'ANNUAL_DEEP',
    discovery_date: '2024-04-01',
    exposure_circumstances: 'Accidental exposure during maintenance work on reactor systems. Personnel was in restricted area longer than planned due to equipment malfunction.',
    prepared_by: 'Test User',
    date_prepared: '2024-04-02',
    rso_signature: 'RSO Signature',
    command_signature: 'Command Signature',
    comments: 'CRITICAL: Over-limit exposure report - immediate action required'
  },
  
  invalidMissingFields: {
    report_type: 'ANNUAL',
    personnel_id: 1,
    // Missing required fields: period_start, period_end, prepared_by, date_prepared
    deep_dose_msv: 2.5
  },
  
  invalidReportType: {
    report_type: 'INVALID_TYPE',
    personnel_id: 1,
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    prepared_by: 'Test User',
    date_prepared: '2024-12-15'
  },
  
  invalidPersonnel: {
    report_type: 'ANNUAL',
    personnel_id: 99999, // Non-existent personnel
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    prepared_by: 'Test User',
    date_prepared: '2024-12-15'
  },
  
  invalidDates: {
    report_type: 'ANNUAL',
    personnel_id: 1,
    period_start: '2024-12-31', // End before start
    period_end: '2024-01-01',
    prepared_by: 'Test User',
    date_prepared: '2024-12-15'
  },
  
  invalidOverLimitMissing: {
    report_type: 'OVER_LIMIT',
    personnel_id: 1,
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    deep_dose_msv: 25.0,
    // Missing required over-limit fields: limit_exceeded, discovery_date, exposure_circumstances
    prepared_by: 'Test User',
    date_prepared: '2024-12-15'
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function logTest(testName, status, message = '', details = null) {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }
  
  testResults.details.push({
    test: testName,
    status,
    message,
    details
  });
}

async function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
    try {
      const url = new URL(`${API_BASE}${endpoint}`);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }
      
      const req = client.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          let parsedData;
          try {
            parsedData = JSON.parse(responseData);
          } catch {
            parsedData = responseData;
          }
          
          resolve({
            status: res.statusCode,
            data: parsedData,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        });
      });
      
      req.on('error', (error) => {
        resolve({
          status: 0,
          data: { error: error.message },
          ok: false
        });
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    } catch (error) {
      resolve({
        status: 0,
        data: { error: error.message },
        ok: false
      });
    }
  });
}

// Test functions
async function testBasicConnectivity() {
  console.log('\n🔌 Testing Basic API Connectivity...');
  
  const response = await makeRequest('/test');
  if (response.ok && response.data.message === 'Radiation routes are working') {
    logTest('Basic Connectivity', 'PASS', 'API endpoint responding correctly');
  } else {
    logTest('Basic Connectivity', 'FAIL', 'API endpoint not responding', response);
  }
}

async function testPersonnelData() {
  console.log('\n👥 Testing Personnel Data Availability...');
  
  const response = await makeRequest('/personnel');
  if (response.ok && Array.isArray(response.data)) {
    if (response.data.length > 0) {
      logTest('Personnel Data', 'PASS', `Found ${response.data.length} personnel records`);
      // Store first personnel for testing
      testPersonnel.valid = response.data[0];
    } else {
      logTest('Personnel Data', 'FAIL', 'No personnel records found - cannot test form submission');
    }
  } else {
    logTest('Personnel Data', 'FAIL', 'Failed to fetch personnel data', response);
  }
}

async function testValidAnnualReport() {
  console.log('\n📊 Testing Valid Annual Report Submission...');
  
  const testData = { ...testReports.validAnnual };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (response.ok && response.data.success) {
    logTest('Valid Annual Report', 'PASS', `Report submitted successfully with ID: ${response.data.report_id}`);
    return response.data.report_id;
  } else {
    logTest('Valid Annual Report', 'FAIL', 'Failed to submit valid annual report', response);
    return null;
  }
}

async function testValidSituationalReport() {
  console.log('\n📋 Testing Valid Situational Report Submission...');
  
  const testData = { ...testReports.validSituational };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (response.ok && response.data.success) {
    logTest('Valid Situational Report', 'PASS', `Report submitted successfully with ID: ${response.data.report_id}`);
    return response.data.report_id;
  } else {
    logTest('Valid Situational Report', 'FAIL', 'Failed to submit valid situational report', response);
    return null;
  }
}

async function testValidOverLimitReport() {
  console.log('\n⚠️ Testing Valid Over-Limit Report Submission...');
  
  const testData = { ...testReports.validOverLimit };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (response.ok && response.data.success) {
    logTest('Valid Over-Limit Report', 'PASS', `Report submitted successfully with ID: ${response.data.report_id}`);
    return response.data.report_id;
  } else {
    logTest('Valid Over-Limit Report', 'FAIL', 'Failed to submit valid over-limit report', response);
    return null;
  }
}

async function testInvalidReportTypes() {
  console.log('\n❌ Testing Invalid Report Type Validation...');
  
  const testData = { ...testReports.invalidReportType };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (!response.ok && response.status === 400 && response.data.error.includes('Invalid report type')) {
    logTest('Invalid Report Type', 'PASS', 'Correctly rejected invalid report type');
  } else {
    logTest('Invalid Report Type', 'FAIL', 'Should have rejected invalid report type', response);
  }
}

async function testMissingRequiredFields() {
  console.log('\n❌ Testing Missing Required Fields Validation...');
  
  const testData = { ...testReports.invalidMissingFields };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (!response.ok && response.status === 400 && response.data.error.includes('Missing required fields')) {
    logTest('Missing Required Fields', 'PASS', 'Correctly rejected report with missing required fields');
  } else {
    logTest('Missing Required Fields', 'FAIL', 'Should have rejected report with missing required fields', response);
  }
}

async function testInvalidPersonnel() {
  console.log('\n❌ Testing Invalid Personnel ID Validation...');
  
  const testData = { ...testReports.invalidPersonnel };
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (!response.ok && response.status === 400 && response.data.error.includes('Invalid personnel ID')) {
    logTest('Invalid Personnel ID', 'PASS', 'Correctly rejected invalid personnel ID');
  } else {
    logTest('Invalid Personnel ID', 'FAIL', 'Should have rejected invalid personnel ID', response);
  }
}

async function testInvalidDates() {
  console.log('\n❌ Testing Invalid Date Range Validation...');
  
  const testData = { ...testReports.invalidDates };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (!response.ok && response.status === 400 && response.data.error.includes('Period end date must be after start date')) {
    logTest('Invalid Date Range', 'PASS', 'Correctly rejected invalid date range');
  } else {
    logTest('Invalid Date Range', 'FAIL', 'Should have rejected invalid date range', response);
  }
}

async function testOverLimitValidation() {
  console.log('\n❌ Testing Over-Limit Report Validation...');
  
  const testData = { ...testReports.invalidOverLimitMissing };
  testData.personnel_id = testPersonnel.valid.id;
  
  const response = await makeRequest('/reports/6470-1', 'POST', testData);
  
  if (!response.ok && response.status === 400 && response.data.error.includes('Over-limit reports require')) {
    logTest('Over-Limit Validation', 'PASS', 'Correctly rejected incomplete over-limit report');
  } else {
    logTest('Over-Limit Validation', 'FAIL', 'Should have rejected incomplete over-limit report', response);
  }
}

async function testReportRetrieval() {
  console.log('\n📖 Testing Report Retrieval...');
  
  const response = await makeRequest('/reports/6470-1');
  
  if (response.ok && response.data.reports && Array.isArray(response.data.reports)) {
    logTest('Report Retrieval', 'PASS', `Retrieved ${response.data.reports.length} reports`);
    
    // Test filtering by personnel
    const personnelResponse = await makeRequest(`/reports/6470-1?personnel_id=${testPersonnel.valid.id}`);
    if (personnelResponse.ok) {
      logTest('Report Filtering', 'PASS', `Filtered reports for personnel ID ${testPersonnel.valid.id}`);
    } else {
      logTest('Report Filtering', 'FAIL', 'Failed to filter reports by personnel', personnelResponse);
    }
    
    // Test filtering by report type
    const typeResponse = await makeRequest('/reports/6470-1?report_type=ANNUAL');
    if (typeResponse.ok) {
      logTest('Report Type Filtering', 'PASS', 'Filtered reports by type');
    } else {
      logTest('Report Type Filtering', 'FAIL', 'Failed to filter reports by type', typeResponse);
    }
  } else {
    logTest('Report Retrieval', 'FAIL', 'Failed to retrieve reports', response);
  }
}

async function testAlertGeneration() {
  console.log('\n🚨 Testing Alert Generation for Over-Limit Reports...');
  
  // Check if alerts were created for over-limit reports
  const response = await makeRequest('/alerts');
  
  if (response.ok && response.data && Array.isArray(response.data)) {
    const overLimitAlerts = response.data.filter(alert => 
      alert.type === 'DOSE_THRESHOLD' && 
      alert.severity === 'CRITICAL' &&
      alert.details && 
      JSON.parse(alert.details).report_type === 'NAVMED_6470_1'
    );
    
    if (overLimitAlerts.length > 0) {
      logTest('Alert Generation', 'PASS', `Generated ${overLimitAlerts.length} critical alerts for over-limit reports`);
    } else {
      logTest('Alert Generation', 'FAIL', 'No alerts generated for over-limit reports');
    }
  } else {
    logTest('Alert Generation', 'FAIL', 'Failed to check alerts', response);
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️ Testing Database Schema...');
  
  const response = await makeRequest('/health');
  
  if (response.ok && response.data) {
    logTest('Database Schema', 'PASS', 'Database connectivity confirmed');
    
    // Check if NAVMED reports table exists by trying to query it
    const reportsResponse = await makeRequest('/reports/6470-1');
    if (reportsResponse.ok) {
      logTest('NAVMED Reports Table', 'PASS', 'NAVMED reports table accessible');
    } else {
      logTest('NAVMED Reports Table', 'FAIL', 'NAVMED reports table not accessible', reportsResponse);
    }
  } else {
    logTest('Database Schema', 'FAIL', 'Database connectivity failed', response);
  }
}

// Main test execution
async function runAllTests() {
  console.log('============================================================');
  console.log('  Testing NAVMED 6470/1 Form - Navy Radiation Health');
  console.log('============================================================');
  
  try {
    // Basic connectivity and data tests
    await testBasicConnectivity();
    await testPersonnelData();
    await testDatabaseSchema();
    
    // Valid report submission tests
    await testValidAnnualReport();
    await testValidSituationalReport();
    await testValidOverLimitReport();
    
    // Validation tests
    await testInvalidReportTypes();
    await testMissingRequiredFields();
    await testInvalidPersonnel();
    await testInvalidDates();
    await testOverLimitValidation();
    
    // Data retrieval and filtering tests
    await testReportRetrieval();
    
    // Alert generation tests
    await testAlertGeneration();
    
  } catch (error) {
    console.error('Test execution error:', error);
    logTest('Test Execution', 'FAIL', `Test execution failed: ${error.message}`);
  }
  
  // Print summary
  console.log('\n============================================================');
  console.log('  Test Summary');
  console.log('============================================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! NAVMED 6470/1 form is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the issues above.');
  }
  
  console.log('\n============================================================');
  
  return testResults;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };
