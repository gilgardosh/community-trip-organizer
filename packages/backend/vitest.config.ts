/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 30000,
    // Increase test timeout to 30 seconds
    testTimeout: 30000,
    // Run tests sequentially to prevent conflicts with mocks
    sequence: {
      hooks: 'list', // Run hooks in sequence
    },
    // Only run one test at a time
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    // Use forked processes for isolation
    pool: 'forks',
    // Reset mocks between test runs
    mockReset: true,
    // Restore all mocks after each test
    restoreMocks: true,
    // Isolate environment between tests
    isolate: true,
  },
});
