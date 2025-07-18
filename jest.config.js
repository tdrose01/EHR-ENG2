module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.vue$': 'vue-jest',
    '^.+\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['vue', 'js'],
  testMatch: ['**/tests/**/*.test.js']
};