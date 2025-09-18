module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.vue$': '@vue/vue3-jest',
    '^.+\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['vue', 'js'],
  testMatch: ['**/tests/**/*.test.js', '!**/tests/frontend/**/*.test.js', '!**/tests/**/*.puppeteer.test.js', '!**/tests/websocket-integration.test.js', '!**/tests/user-management.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@vue/test-utils))'
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  testTimeout: 10000,
  globals: {
    'vue-jest': {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('v-')
      }
    }
  }
};