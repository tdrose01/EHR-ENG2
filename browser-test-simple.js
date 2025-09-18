const puppeteer = require('puppeteer');

async function runBrowserTest() {
  console.log('🚀 Starting EHR Browser Test...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 100, // Slow down operations for better visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🌐 Navigating to EHR application...');
    
    // Navigate to the application
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Get page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check for login form elements
    console.log('🔍 Looking for form elements...');
    
    const emailInput = await page.$('input[type="email"], input[id*="email"], input[name*="email"]');
    const passwordInput = await page.$('input[type="password"], input[id*="password"], input[name*="password"]');
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    
    if (emailInput) {
      console.log('✅ Email input found');
      await emailInput.type('test@example.com');
      console.log('✅ Successfully typed in email input');
    }
    
    if (passwordInput) {
      console.log('✅ Password input found');
      await passwordInput.type('testpassword');
      console.log('✅ Successfully typed in password input');
    }
    
    if (submitButton) {
      console.log('✅ Submit button found');
    }
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:');
      consoleErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ No console errors found');
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'browser-test-screenshot.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved to browser-test-screenshot.png');
    
    // Test API connectivity
    console.log('🔌 Testing API connectivity...');
    try {
      const response = await page.goto('http://localhost:3005/api/hello', { 
        waitUntil: 'networkidle2',
        timeout: 5000 
      });
      
      if (response && response.status() === 200) {
        console.log('✅ Backend API is responding');
      } else {
        console.log('⚠️ Backend API response status:', response ? response.status() : 'No response');
      }
    } catch (error) {
      console.log('❌ Backend API test failed:', error.message);
    }
    
    console.log('🎉 Browser test completed successfully!');
    
  } catch (error) {
    console.error('❌ Browser test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the test
runBrowserTest().catch(console.error);
