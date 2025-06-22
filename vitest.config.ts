import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/frontend/**/*.spec.ts'],
    exclude: ['tests/backend/**', 'tests/frontend/*.test.js', 'node_modules/**']
  }
})
