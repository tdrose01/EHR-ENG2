#!/usr/bin/env node

/**
 * Security Fixes Script for EHR ENG2
 * This script applies critical security fixes to the codebase
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Applying Critical Security Fixes...\n');

// Fix 1: Remove password logging
console.log('1. Fixing password logging in server/index.js...');
const serverIndexPath = 'server/index.js';
let serverIndexContent = fs.readFileSync(serverIndexPath, 'utf8');

// Replace password logging
serverIndexContent = serverIndexContent.replace(
  /console\.log\('Login attempt:', \{ email, password \}\)/g,
  "console.log('Login attempt:', { email, password: '[REDACTED]' })"
);

fs.writeFileSync(serverIndexPath, serverIndexContent);
console.log('   ✅ Password logging fixed\n');

// Fix 2: Add security headers
console.log('2. Adding security headers...');
const helmetInstall = `const helmet = require('helmet');`;
const helmetUse = `app.use(helmet());`;

// Add helmet import
if (!serverIndexContent.includes('helmet')) {
  serverIndexContent = serverIndexContent.replace(
    /const cors = require\('cors'\)/,
    `const cors = require('cors')\nconst helmet = require('helmet')`
  );
}

// Add helmet middleware
if (!serverIndexContent.includes('app.use(helmet())')) {
  serverIndexContent = serverIndexContent.replace(
    /app\.use\(express\.json\(\)\)/,
    `app.use(express.json())\napp.use(helmet())`
  );
}

fs.writeFileSync(serverIndexPath, serverIndexContent);
console.log('   ✅ Security headers added\n');

// Fix 3: Create .env.example file
console.log('3. Creating .env.example file...');
const envExample = `# EHR ENG2 Environment Variables
# Copy this file to .env and update with your actual values

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ehr_eng2

# Server Configuration
PORT=3005
NODE_ENV=development

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key-here

# Email Configuration (Optional)
EMAIL_NOTIFICATIONS=false
ALERT_EMAIL_RECIPIENTS=admin@example.com
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Slack Configuration (Optional)
SLACK_NOTIFICATIONS=false
SLACK_WEBHOOK_URL=
SLACK_CHANNEL=#alerts
SLACK_USERNAME=Radiation Health Monitor

# Monitoring Configuration
LOG_LEVEL=info
FILE_LOGGING=false
LOG_FILE_PATH=./logs/monitoring.log

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
`;

fs.writeFileSync('.env.example', envExample);
console.log('   ✅ .env.example created\n');

// Fix 4: Create security middleware
console.log('4. Creating security middleware...');
const securityMiddleware = `const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitize input
const sanitizeInput = (req, res, next) => {
  // Basic XSS prevention
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim();
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = {
  limiter,
  validateInput,
  sanitizeInput,
  errorHandler
};
`;

fs.writeFileSync('server/middleware/security.js', securityMiddleware);
console.log('   ✅ Security middleware created\n');

// Fix 5: Update package.json with security dependencies
console.log('5. Adding security dependencies...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add security dependencies
const securityDeps = {
  'helmet': '^7.1.0',
  'express-rate-limit': '^7.1.5',
  'express-validator': '^7.0.1',
  'bcrypt': '^5.1.1',
  'jsonwebtoken': '^9.0.2'
};

Object.assign(packageJson.dependencies, securityDeps);
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('   ✅ Security dependencies added\n');

console.log('🎉 Security fixes applied successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Run: npm install');
console.log('2. Copy .env.example to .env and update values');
console.log('3. Update server/index.js to use security middleware');
console.log('4. Run: npm audit fix');
console.log('5. Test the application thoroughly');
console.log('\n⚠️  Remember to review and test all changes before deploying to production!');
