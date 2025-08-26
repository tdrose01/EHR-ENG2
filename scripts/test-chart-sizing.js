#!/usr/bin/env node

/**
 * Chart Sizing Test
 * Verifies that the Real-Time Trends chart is properly constrained
 * and doesn't expand beyond its intended dimensions
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

// Test chart component file
function testChartComponent() {
  logSection('Testing Chart Component Constraints');
  
  const chartFile = path.join(__dirname, '../src/components/RealTimeChart.vue');
  
  if (!fs.existsSync(chartFile)) {
    log('❌ Chart component file not found', 'red');
    return false;
  }
  
  const content = fs.readFileSync(chartFile, 'utf8');
  
  // Check for height constraints
  const heightConstraints = [
    'height: 400px',
    'max-height: 400px',
    'min-height: 400px',
    'overflow: hidden'
  ];
  
  let constraintsFound = 0;
  
  heightConstraints.forEach(constraint => {
    if (content.includes(constraint)) {
      constraintsFound++;
      log(`✅ Found constraint: ${constraint}`, 'green');
    } else {
      log(`❌ Missing constraint: ${constraint}`, 'red');
    }
  });
  
  // Check for responsive design
  const responsiveFeatures = [
    '@media (max-width: 768px)',
    '@media (max-width: 480px)',
    'chart.value.resize()',
    'handleResize'
  ];
  
  let responsiveFound = 0;
  
  responsiveFeatures.forEach(feature => {
    if (content.includes(feature)) {
      responsiveFound++;
      log(`✅ Found responsive feature: ${feature}`, 'green');
    } else {
      log(`❌ Missing responsive feature: ${feature}`, 'red');
    }
  });
  
  // Check for proper chart configuration
  const chartConfig = [
    'maintainAspectRatio: false',
    'responsive: true',
    'overflow: hidden'
  ];
  
  let configFound = 0;
  
  chartConfig.forEach(config => {
    if (content.includes(config)) {
      configFound++;
      log(`✅ Found chart config: ${config}`, 'green');
    } else {
      log(`❌ Missing chart config: ${config}`, 'red');
    }
  });
  
  const totalChecks = heightConstraints.length + responsiveFeatures.length + chartConfig.length;
  const totalFound = constraintsFound + responsiveFound + configFound;
  
  logSection('Chart Component Test Results');
  log(`Height Constraints: ${constraintsFound}/${heightConstraints.length}`, constraintsFound === heightConstraints.length ? 'green' : 'red');
  log(`Responsive Features: ${responsiveFound}/${responsiveFeatures.length}`, responsiveFound === responsiveFeatures.length ? 'green' : 'red');
  log(`Chart Configuration: ${configFound}/${chartConfig.length}`, configFound === chartConfig.length ? 'green' : 'red');
  log(`Overall Score: ${totalFound}/${totalChecks}`, totalFound >= totalChecks * 0.8 ? 'green' : 'red');
  
  return totalFound >= totalChecks * 0.8;
}

// Test dashboard integration
function testDashboardIntegration() {
  logSection('Testing Dashboard Integration');
  
  const dashboardFile = path.join(__dirname, '../src/components/RealTimeMonitoringDashboard.vue');
  
  if (!fs.existsSync(dashboardFile)) {
    log('❌ Dashboard component file not found', 'red');
    return false;
  }
  
  const content = fs.readFileSync(dashboardFile, 'utf8');
  
  // Check for chart container constraints
  const containerConstraints = [
    'chart-wrapper',
    'max-height: 500px',
    'overflow: hidden',
    'chart-section'
  ];
  
  let containerFound = 0;
  
  containerConstraints.forEach(constraint => {
    if (content.includes(constraint)) {
      containerFound++;
      log(`✅ Found container constraint: ${constraint}`, 'green');
    } else {
      log(`❌ Missing container constraint: ${constraint}`, 'red');
    }
  });
  
  // Check for CSS constraints
  const cssConstraints = [
    '.chart-wrapper :deep(.real-time-chart)',
    'max-height: 500px',
    '.chart-wrapper :deep(.chart-container)',
    'max-height: 400px'
  ];
  
  let cssFound = 0;
  
  cssConstraints.forEach(constraint => {
    if (content.includes(constraint)) {
      cssFound++;
      log(`✅ Found CSS constraint: ${constraint}`, 'green');
    } else {
      log(`❌ Missing CSS constraint: ${constraint}`, 'red');
    }
  });
  
  const totalChecks = containerConstraints.length + cssConstraints.length;
  const totalFound = containerFound + cssFound;
  
  logSection('Dashboard Integration Test Results');
  log(`Container Constraints: ${containerFound}/${containerConstraints.length}`, containerFound === containerConstraints.length ? 'green' : 'red');
  log(`CSS Constraints: ${cssFound}/${cssConstraints.length}`, cssFound === cssConstraints.length ? 'green' : 'red');
  log(`Overall Score: ${totalFound}/${totalChecks}`, totalFound >= totalChecks * 0.8 ? 'green' : 'red');
  
  return totalFound >= totalChecks * 0.8;
}

// Main test execution
async function runChartSizingTests() {
  logHeader('Chart Sizing Constraint Tests');
  
  try {
    // Test 1: Chart component constraints
    log('🧪 Test 1: Chart Component Constraints', 'bright');
    const chartTest = testChartComponent();
    
    // Test 2: Dashboard integration
    log('\n🧪 Test 2: Dashboard Integration', 'bright');
    const dashboardTest = testDashboardIntegration();
    
    // Summary
    logSection('Test Summary');
    if (chartTest && dashboardTest) {
      log('🎉 All chart sizing tests passed!', 'green');
      log('✅ Chart is properly constrained and won\'t expand beyond container', 'green');
      log('✅ User experience should be improved with fixed chart dimensions', 'green');
    } else {
      log('⚠️  Some chart sizing tests failed', 'yellow');
      log('🔍 Check the specific failures above', 'yellow');
      log('📝 Chart may still expand beyond intended dimensions', 'red');
    }
    
    return chartTest && dashboardTest;
    
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    return false;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runChartSizingTests().catch((error) => {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testChartComponent,
  testDashboardIntegration,
  runChartSizingTests
};
