const puppeteer = require('puppeteer')

describe('MCP Login (Puppeteer)', () => {
  let browser, page
  const baseUrl = process.env.MCP_URL || 'http://localhost:5173/'
  const validEmail = 'admin@example.com'
  const validPassword = 'password123'
  const invalidPassword = 'wrongpassword'

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'new' })
    page = await browser.newPage()
  })

  afterAll(async () => {
    if (browser) await browser.close()
  })

  it('logs in successfully with valid credentials', async () => {
    // Go to login page
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 10000 })
    // Fill in email
    await page.type('input#email', validEmail)
    // Fill in password
    await page.type('input#password', validPassword)
    // Click login button
    await page.click('button[type="submit"]')
    // Wait for navigation or heading
    await page.waitForSelector('h1', { timeout: 5000 })
    // Check for module selection heading
    const heading = await page.$eval('h1', el => el.textContent)
    expect(heading).toMatch(/select module/i)
  }, 20000)

  it('shows error with invalid credentials', async () => {
    // Reload login page
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 10000 })
    // Fill in email
    await page.type('input#email', validEmail)
    // Fill in wrong password
    await page.type('input#password', invalidPassword)
    // Click login button
    await page.click('button[type="submit"]')
    // Wait for error message
    await page.waitForSelector('.text-red-600', { timeout: 5000 })
    // Check error text
    const errorText = await page.$eval('.text-red-600', el => el.textContent)
    expect(errorText).toMatch(/invalid|error|credentials/i)
  }, 20000)
}) 