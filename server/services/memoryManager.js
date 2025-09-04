const EventEmitter = require('events');

/**
 * Memory Management Service
 * Provides memory optimization, monitoring, and cleanup functionality
 */
class MemoryManager extends EventEmitter {
  constructor() {
    super();
    this.memoryThresholds = {
      warning: 80,    // 80% memory usage warning
      critical: 90,   // 90% memory usage critical
      max: 95         // 95% memory usage max before forced cleanup
    };
    
    this.cleanupInterval = null;
    this.forceGcInterval = null;
    this.isMonitoring = false;
    
    this.startMonitoring();
  }

  // Start memory monitoring
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Check memory every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Force garbage collection every 5 minutes
    this.forceGcInterval = setInterval(() => {
      this.forceGarbageCollection();
    }, 300000);

    console.log('🧠 Memory Manager started');
  }

  // Stop memory monitoring
  stopMonitoring() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.forceGcInterval) {
      clearInterval(this.forceGcInterval);
      this.forceGcInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('🧠 Memory Manager stopped');
  }

  // Check current memory usage
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercent = (usedMemory / totalMemory) * 100;
    
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(memUsage.external / 1024 / 1024);
    
    const memoryInfo = {
      system: {
        total: Math.round(totalMemory / 1024 / 1024),
        used: Math.round(usedMemory / 1024 / 1024),
        free: Math.round(freeMemory / 1024 / 1024),
        percent: Math.round(memoryPercent * 100) / 100
      },
      process: {
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        external: externalMB,
        rss: Math.round(memUsage.rss / 1024 / 1024),
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
      }
    };

    // Emit memory status
    this.emit('memoryStatus', memoryInfo);

    // Check thresholds
    if (memoryPercent >= this.memoryThresholds.max) {
      this.emit('memoryCritical', memoryInfo);
      this.performEmergencyCleanup();
    } else if (memoryPercent >= this.memoryThresholds.critical) {
      this.emit('memoryCritical', memoryInfo);
      this.performAggressiveCleanup();
    } else if (memoryPercent >= this.memoryThresholds.warning) {
      this.emit('memoryWarning', memoryInfo);
      this.performStandardCleanup();
    }

    return memoryInfo;
  }

  // Perform standard cleanup
  performStandardCleanup() {
    console.log('🧹 Performing standard memory cleanup');
    
    // Force garbage collection
    this.forceGarbageCollection();
    
    // Clear any cached data
    this.clearCaches();
    
    this.emit('cleanupPerformed', 'standard');
  }

  // Perform aggressive cleanup
  performAggressiveCleanup() {
    console.log('🧹 Performing aggressive memory cleanup');
    
    // Force garbage collection multiple times
    for (let i = 0; i < 3; i++) {
      this.forceGarbageCollection();
    }
    
    // Clear all caches
    this.clearCaches();
    
    // Clear any large objects
    this.clearLargeObjects();
    
    this.emit('cleanupPerformed', 'aggressive');
  }

  // Perform emergency cleanup
  performEmergencyCleanup() {
    console.log('🚨 Performing emergency memory cleanup');
    
    // Force garbage collection multiple times
    for (let i = 0; i < 5; i++) {
      this.forceGarbageCollection();
    }
    
    // Clear all caches and objects
    this.clearCaches();
    this.clearLargeObjects();
    
    // Try to free as much memory as possible
    this.freeMemory();
    
    this.emit('cleanupPerformed', 'emergency');
  }

  // Force garbage collection
  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('🗑️ Forced garbage collection');
    } else {
      console.log('⚠️ Garbage collection not available (run with --expose-gc)');
    }
  }

  // Clear application caches
  clearCaches() {
    // Clear require cache for non-essential modules
    const cacheKeys = Object.keys(require.cache);
    const nonEssentialModules = cacheKeys.filter(key => 
      key.includes('node_modules') && 
      !key.includes('pg') && 
      !key.includes('express') &&
      !key.includes('ws')
    );
    
    nonEssentialModules.forEach(key => {
      delete require.cache[key];
    });
    
    if (nonEssentialModules.length > 0) {
      console.log(`🧹 Cleared ${nonEssentialModules.length} non-essential modules from cache`);
    }
  }

  // Clear large objects
  clearLargeObjects() {
    // Clear any large arrays or objects that might be stored globally
    if (global.largeObjects) {
      global.largeObjects = {};
    }
    
    // Clear any temporary data
    if (global.tempData) {
      global.tempData = {};
    }
  }

  // Free memory by clearing unused data
  freeMemory() {
    // Clear any unused timers
    const activeTimers = process._getActiveHandles();
    const activeRequests = process._getActiveRequests();
    
    console.log(`🧹 Active handles: ${activeTimers.length}, Active requests: ${activeRequests.length}`);
    
    // Clear any unused event listeners
    this.removeAllListeners();
  }

  // Get memory statistics
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercent = (usedMemory / totalMemory) * 100;
    
    return {
      system: {
        total: Math.round(totalMemory / 1024 / 1024),
        used: Math.round(usedMemory / 1024 / 1024),
        free: Math.round(freeMemory / 1024 / 1024),
        percent: Math.round(memoryPercent * 100) / 100
      },
      process: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
      },
      uptime: process.uptime(),
      pid: process.pid
    };
  }

  // Set memory thresholds
  setThresholds(warning, critical, max) {
    this.memoryThresholds.warning = warning;
    this.memoryThresholds.critical = critical;
    this.memoryThresholds.max = max;
    
    console.log(`🧠 Memory thresholds updated: Warning=${warning}%, Critical=${critical}%, Max=${max}%`);
  }

  // Cleanup method for graceful shutdown
  cleanup() {
    this.stopMonitoring();
    this.removeAllListeners();
    console.log('🧠 Memory Manager cleaned up');
  }
}

module.exports = new MemoryManager();
