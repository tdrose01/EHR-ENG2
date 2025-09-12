#!/usr/bin/env node

/**
 * Optimized Server Startup Script
 * Starts the server with memory optimization flags and proper configuration
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting optimized EHR-ENG2 server...');
console.log('📊 Memory optimization enabled');
console.log('🗑️ Garbage collection enabled');
console.log('⚡ Performance optimizations active');

// Start the server with optimization flags
const serverProcess = spawn('node', [
  '--expose-gc',                    // Enable garbage collection
  '--max-old-space-size=2048',      // Limit heap size to 2GB
  '--optimize-for-size',            // Optimize for memory usage
  '--gc-interval=100',              // More frequent garbage collection
  path.join(__dirname, '..', 'server', 'index.js')
], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
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

console.log('✅ Server started successfully');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🔧 Backend: http://localhost:3005');
console.log('📊 Monitoring: http://localhost:3005/api/monitoring/status');
console.log('💾 Memory stats: http://localhost:3005/api/monitoring/memory');
console.log('\nPress Ctrl+C to stop the server');