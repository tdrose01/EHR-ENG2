#!/usr/bin/env node

/**
 * WebSocket Integration Test Runner
 * Runs comprehensive regression tests for Real-time WebSocket functionality
 * 
 * Usage:
 *   node scripts/test-websocket-integration.js
 *   node scripts/test-websocket-integration.js --watch
 *   node scripts/test-websocket-integration.js --verbose
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const TEST_FILE = 'tests/websocket-integration.test.js';
const JEST_CONFIG = {
  testEnvironment: 'node',
  testTimeout: 10000,
  verbose: process.argv.includes('--verbose'),
  watch: process.argv.includes('--watch'),
  coverage: process.argv.includes('--coverage')
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSection(title) {
  log(`\n${title}`, 'yellow');
  log('-'.repeat(title.length));
}

// Check prerequisites
function checkPrerequisites() {
  logSection('Checking Prerequisites');
  
  // Check if test file exists
  if (!fs.existsSync(TEST_FILE)) {
    log(`❌ Test file not found: ${TEST_FILE}`, 'red');
    log('Please ensure the WebSocket integration tests are properly set up.', 'red');
    process.exit(1);
  }
  
  // Check if Jest is available
  try {
    require.resolve('jest');
    log('✅ Jest testing framework available', 'green');
  } catch (error) {
    log('❌ Jest not found. Installing...', 'yellow');
    return false;
  }
  
  // Check if ws package is available
  try {
    require.resolve('ws');
    log('✅ WebSocket (ws) package available', 'green');
  } catch (error) {
    log('❌ WebSocket package not found. Installing...', 'yellow');
    return false;
  }
  
  log('✅ All prerequisites met', 'green');
  return true;
}

// Install missing dependencies
async function installDependencies() {
  logSection('Installing Missing Dependencies');
  
  const packages = ['jest', 'ws'];
  
  for (const pkg of packages) {
    try {
      require.resolve(pkg);
      log(`✅ ${pkg} already installed`, 'green');
    } catch (error) {
      log(`📦 Installing ${pkg}...`, 'yellow');
      
      try {
        await new Promise((resolve, reject) => {
          const install = spawn('npm', ['install', '--save-dev', pkg], {
            stdio: 'inherit',
            shell: true
          });
          
          install.on('close', (code) => {
            if (code === 0) {
              log(`✅ ${pkg} installed successfully`, 'green');
              resolve();
            } else {
              reject(new Error(`Failed to install ${pkg}`));
            }
          });
        });
      } catch (error) {
        log(`❌ Failed to install ${pkg}: ${error.message}`, 'red');
        process.exit(1);
      }
    }
  }
}

// Run WebSocket tests
function runWebSocketTests() {
  logSection('Running WebSocket Integration Tests');
  
  const args = [
    'node_modules/.bin/jest',
    TEST_FILE,
    '--testEnvironment=node',
    '--testTimeout=10000'
  ];
  
  if (JEST_CONFIG.verbose) {
    args.push('--verbose');
  }
  
  if (JEST_CONFIG.watch) {
    args.push('--watch');
  }
  
  if (JEST_CONFIG.coverage) {
    args.push('--coverage');
  }
  
  log(`🚀 Starting tests with command: ${args.join(' ')}`, 'blue');
  
  const jest = spawn(args[0], args.slice(1), {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'test' }
  });
  
  jest.on('close', (code) => {
    if (code === 0) {
      log('\n🎉 All WebSocket integration tests passed!', 'green');
      log('✅ Real-time functionality is working correctly', 'green');
    } else {
      log('\n❌ Some WebSocket integration tests failed', 'red');
      log('🔍 Check the test output above for details', 'yellow');
      process.exit(code);
    }
  });
  
  jest.on('error', (error) => {
    log(`❌ Failed to run tests: ${error.message}`, 'red');
    process.exit(1);
  });
}

// Run specific test categories
function runTestCategory(category) {
  logSection(`Running ${category} Tests`);
  
  const args = [
    'node_modules/.bin/jest',
    TEST_FILE,
    '--testNamePattern',
    category,
    '--testEnvironment=node',
    '--testTimeout=10000'
  ];
  
  if (JEST_CONFIG.verbose) {
    args.push('--verbose');
  }
  
  log(`🎯 Running tests matching: ${category}`, 'blue');
  
  const jest = spawn(args[0], args.slice(1), {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'test' }
  });
  
  jest.on('close', (code) => {
    if (code === 0) {
      log(`✅ ${category} tests completed successfully`, 'green');
    } else {
      log(`❌ ${category} tests failed`, 'red');
      process.exit(code);
    }
  });
}

// Show test categories
function showTestCategories() {
  logSection('Available Test Categories');
  
  const categories = [
    'Connection & Authentication',
    'Channel Subscription & Broadcasting',
    'Radiation Health Specific Broadcasting',
    'Room-based Broadcasting',
    'Heartbeat & Connection Management',
    'Security & Permissions',
    'Statistics & Monitoring',
    'Cleanup & Error Handling',
    'Frontend WebSocket Composable',
    'End-to-End Integration'
  ];
  
  categories.forEach((category, index) => {
    log(`${index + 1}. ${category}`, 'cyan');
  });
  
  log('\nTo run a specific category:', 'yellow');
  log('node scripts/test-websocket-integration.js --category "Connection"', 'white');
}

// Main execution
async function main() {
  logHeader('WebSocket Integration Test Runner');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    log('\nUsage Options:', 'bright');
    log('  --watch          Run tests in watch mode', 'white');
    log('  --verbose        Show detailed test output', 'white');
    log('  --coverage       Generate coverage report', 'white');
    log('  --category=NAME  Run tests matching category name', 'white');
    log('  --help, -h       Show this help message', 'white');
    log('\nExamples:', 'bright');
    log('  node scripts/test-websocket-integration.js', 'white');
    log('  node scripts/test-websocket-integration.js --watch', 'white');
    log('  node scripts/test-websocket-integration.js --category "Connection"', 'white');
    log('  node scripts/test-websocket-integration.js --verbose --coverage', 'white');
    return;
  }
  
  // Check if specific category requested
  if (category) {
    log(`🎯 Running tests for category: ${category}`, 'bright');
    if (!checkPrerequisites()) {
      await installDependencies();
    }
    runTestCategory(category);
    return;
  }
  
  // Show categories if requested
  if (args.includes('--categories')) {
    showTestCategories();
    return;
  }
  
  // Full test run
  log('🧪 Running comprehensive WebSocket integration tests...', 'blue');
  
  if (!checkPrerequisites()) {
    await installDependencies();
  }
  
  runWebSocketTests();
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n🛑 Test run interrupted by user', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Test run terminated', 'yellow');
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main().catch((error) => {
    log(`❌ Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runWebSocketTests,
  runTestCategory,
  checkPrerequisites,
  installDependencies
};
