import { defineProject } from '@bemedev/dev-utils/vitest-extended';
import solid from 'vite-plugin-solid';

export default defineProject({
  plugins: [solid()],
  resolve: { tsconfigPaths: true },
  test: {
    name: 'mind-flow',
    bail: 100,
    maxConcurrency: 10,
    environment: 'jsdom',
    env: { NODE_ENV: 'test' },
    globals: true,
    logHeapUsage: false,
    testTimeout: 30000,
  },
});
