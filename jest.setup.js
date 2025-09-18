// Jest setup file for Vue 3 testing

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for setImmediate
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args))
global.clearImmediate = global.clearImmediate || clearTimeout

// Mock global objects that might be used in components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Only configure Vue Test Utils if we're in a Vue test
if (typeof window !== 'undefined' && window.Vue) {
  const { config } = require('@vue/test-utils')
  config.global.mocks = {
    $t: (msg) => msg, // Mock i18n
  }
}

// Global test teardown to prevent database connection leaks
afterAll(async () => {
  // Force close any remaining database connections
  if (global.pool) {
    await global.pool.end();
  }
  
  // Clear any remaining timers
  if (global.gc) {
    global.gc();
  }
  
  // Wait a bit for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});
