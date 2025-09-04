#!/usr/bin/env node

/**
 * Memory Optimization Script
 * Provides tools to monitor and optimize memory usage
 */

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
let fetch;
try {
  fetch = globalThis.fetch;
} catch (e) {
  fetch = require('node-fetch');
}

const API_BASE = 'http://localhost:3005/api/monitoring';

async function getMemoryStats() {
  try {
    const response = await fetch(`${API_BASE}/memory`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ Failed to get memory stats:', error.message);
    return null;
  }
}

async function performCleanup(type = 'standard') {
  try {
    const response = await fetch(`${API_BASE}/memory/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log(`✅ Memory cleanup performed: ${type}`);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ Failed to perform cleanup:', error.message);
    return null;
  }
}

async function setThresholds(warning, critical, max) {
  try {
    const response = await fetch(`${API_BASE}/memory/thresholds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ warning, critical, max })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('✅ Memory thresholds updated');
      return data.thresholds;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ Failed to set thresholds:', error.message);
    return null;
  }
}

function formatMemoryStats(stats) {
  if (!stats) return 'No data available';
  
  const { system, process } = stats;
  
  return `
📊 Memory Statistics:
  System Memory:
    Total: ${system.total} MB
    Used: ${system.used} MB (${system.percent}%)
    Free: ${system.free} MB
  
  Process Memory:
    Heap Used: ${process.heapUsed} MB
    Heap Total: ${process.heapTotal} MB
    External: ${process.external} MB
    RSS: ${process.rss} MB
    Array Buffers: ${process.arrayBuffers} MB
  
  Process Info:
    PID: ${stats.pid}
    Uptime: ${Math.round(stats.uptime / 60)} minutes
  `;
}

function getMemoryStatus(stats) {
  if (!stats) return 'UNKNOWN';
  
  const percent = stats.system.percent;
  
  if (percent >= 95) return 'CRITICAL';
  if (percent >= 90) return 'HIGH';
  if (percent >= 80) return 'WARNING';
  if (percent >= 70) return 'ELEVATED';
  return 'NORMAL';
}

async function monitorMemory(interval = 30000) {
  console.log(`🔍 Starting memory monitoring (every ${interval / 1000} seconds)`);
  console.log('Press Ctrl+C to stop\n');
  
  const monitor = setInterval(async () => {
    const stats = await getMemoryStats();
    if (stats) {
      const status = getMemoryStatus(stats);
      const statusIcon = {
        'CRITICAL': '🚨',
        'HIGH': '⚠️',
        'WARNING': '⚠️',
        'ELEVATED': '📈',
        'NORMAL': '✅'
      }[status] || '❓';
      
      console.log(`${statusIcon} [${new Date().toISOString()}] Memory: ${stats.system.percent}% (${status})`);
      
      // Auto-cleanup based on status
      if (status === 'CRITICAL') {
        console.log('🚨 Critical memory usage detected, performing emergency cleanup...');
        await performCleanup('emergency');
      } else if (status === 'HIGH') {
        console.log('⚠️ High memory usage detected, performing aggressive cleanup...');
        await performCleanup('aggressive');
      } else if (status === 'WARNING') {
        console.log('⚠️ Memory warning, performing standard cleanup...');
        await performCleanup('standard');
      }
    }
  }, interval);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping memory monitoring...');
    clearInterval(monitor);
    process.exit(0);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'stats':
      const stats = await getMemoryStats();
      console.log(formatMemoryStats(stats));
      break;
      
    case 'cleanup':
      const type = args[1] || 'standard';
      const validTypes = ['standard', 'aggressive', 'emergency'];
      
      if (!validTypes.includes(type)) {
        console.error('❌ Invalid cleanup type. Use: standard, aggressive, or emergency');
        process.exit(1);
      }
      
      const cleanupStats = await performCleanup(type);
      if (cleanupStats) {
        console.log(formatMemoryStats(cleanupStats));
      }
      break;
      
    case 'thresholds':
      const warning = parseInt(args[1]);
      const critical = parseInt(args[2]);
      const max = parseInt(args[3]);
      
      if (!warning || !critical || !max) {
        console.error('❌ Usage: node optimize-memory.js thresholds <warning> <critical> <max>');
        console.error('Example: node optimize-memory.js thresholds 70 85 95');
        process.exit(1);
      }
      
      await setThresholds(warning, critical, max);
      break;
      
    case 'monitor':
      const interval = parseInt(args[1]) * 1000 || 30000;
      await monitorMemory(interval);
      break;
      
    case 'help':
    default:
      console.log(`
🧠 Memory Optimization Tool

Usage: node optimize-memory.js <command> [options]

Commands:
  stats                    Show current memory statistics
  cleanup [type]          Perform memory cleanup (standard|aggressive|emergency)
  thresholds <w> <c> <m>  Set memory thresholds (warning, critical, max)
  monitor [seconds]       Monitor memory usage (default: 30 seconds)
  help                    Show this help message

Examples:
  node optimize-memory.js stats
  node optimize-memory.js cleanup aggressive
  node optimize-memory.js thresholds 70 85 95
  node optimize-memory.js monitor 60
      `);
      break;
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
});
