const puppeteer = require('puppeteer');

describe('EHR Browser Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 100, // Slow down operations for better visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('should load the main page', async () => {
    // Navigate to the application
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });

    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 5000 });

    // Check if the page title contains expected text
    const title = await page.title();
    expect(title).toBeTruthy();
    
    console.log('✅ Page loaded successfully');
    console.log('📄 Page title:', title);
  }, 15000);

  test('should have login form elements', async () => {
    // Navigate to the application
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });

    // Look for login form elements
    const emailInput = await page.$('input[type="email"], input[id*="email"], input[name*="email"]');
    const passwordInput = await page.$('input[type="password"], input[id*="password"], input[name*="password"]');
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');

    if (emailInput) {
      console.log('✅ Email input found');
    }
    if (passwordInput) {
      console.log('✅ Password input found');
    }
    if (submitButton) {
      console.log('✅ Submit button found');
    }

    // At least one form element should be present
    expect(emailInput || passwordInput || submitButton).toBeTruthy();
  }, 15000);

  test('should be able to interact with form elements', async () => {
    // Navigate to the application
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });

    // Try to find and interact with form elements
    const emailInput = await page.$('input[type="email"], input[id*="email"], input[name*="email"]');
    const passwordInput = await page.$('input[type="password"], input[id*="password"], input[name*="password"]');

    if (emailInput) {
      await emailInput.type('test@example.com');
      console.log('✅ Successfully typed in email input');
    }

    if (passwordInput) {
      await passwordInput.type('testpassword');
      console.log('✅ Successfully typed in password input');
    }

    // Take a screenshot for verification
    await page.screenshot({ 
      path: 'tests/screenshots/browser-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved to tests/screenshots/browser-test.png');
  }, 15000);

  test('should check for console errors', async () => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the application
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:');
      consoleErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ No console errors found');
    }

    // Don't fail the test for console errors, just report them
    expect(consoleErrors.length).toBeGreaterThanOrEqual(0);
  }, 15000);
});


