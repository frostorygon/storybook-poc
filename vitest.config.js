import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Run component tests in a real Chromium browser via Playwright
    // This is required for custom elements / Shadow DOM to work correctly
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },

    // Load scoped custom element registry polyfill before component code
    setupFiles: ['./src/vitest-setup.js'],

    // Tests live in the dedicated test/ folder (open-wc convention)
    include: ['test/**/*.test.{js,ts}'],

    // Coverage via v8 (built into Node, no extra install)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/components/**', 'src/screens/**', 'src/services/**', 'src/*.js'],
      exclude: ['src/docs/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },

    // Shorter timeout for CI
    testTimeout: 10000,
  },
});
