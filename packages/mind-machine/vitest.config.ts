import { fileURLToPath } from 'node:url';

import { defineProject } from '@bemedev/dev-utils/vitest-extended';
import solid from 'vite-plugin-solid';

/** Path to the DOM bundle of `@bemedev/mind-flow` (its `node` condition is SSR). */
const mindFlowBrowserEntry = fileURLToPath(
  new URL('../mindapp/lib/index.es.js', import.meta.url),
);

export default defineProject({
  plugins: [solid()],
  resolve: {
    alias: { '@bemedev/mind-flow': mindFlowBrowserEntry },
    tsconfigPaths: true,
  },
  test: {
    name: 'mind-machine',
    bail: 100,
    maxConcurrency: 10,
    environment: 'jsdom',
    env: { NODE_ENV: 'test' },
    globals: true,
    logHeapUsage: false,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30000,
  },
});
