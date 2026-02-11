import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 30000,
    fileParallelism: false,
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/spaces_service_test',
      JWT_SECRET: 'test-jwt-secret',
      NODE_ENV: 'test',
    },
  },
});
