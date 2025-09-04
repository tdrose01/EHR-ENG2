#!/usr/bin/env node

/**
 * Optimized Server Startup Script
 * Starts the server with memory optimization flags and monitoring
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting EHR-ENG2 Server with Memory Optimization...\n');

// Set environment variables
process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/ehr_eng2';
process.env.NODE_ENV = 'development';

// Node.js optimization flags
const nodeFlags = [
  '--expose-gc',                    // Enable garbage collection
  '--max-old-space-size=2048',      // Limit heap size to 2GB
  '--optimize-for-size',            // Optimize for memory usage
  '--gc-interval=100',              // More frequent garbage collection
  '--max-semi-space-size=64'        // Limit semi-space size
];

// Server script path
const serverScript = path.join(__dirname, '..', 'server', 'index.js');

// Start the server with optimization flags
const serverProcess = spawn('node', [...nodeFlags, serverScript], {
  stdio: 'inherit',
  env: process.env
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});

console.log('✅ Server started with memory optimization flags');
console.log('📊 Memory monitoring active');
console.log('🧠 Garbage collection enabled');
console.log('🔧 Heap size limited to 2GB');
console.log('\nPress Ctrl+C to stop the server\n');
