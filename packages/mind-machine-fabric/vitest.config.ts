import { fileURLToPath } from 'node:url';

import { defineProject } from '@bemedev/dev-utils/vitest-extended';
import solid from 'vite-plugin-solid';

/**
 * Path to the DOM bundle of `@bemedev/mind-flow-fabric` (its `node` condition is
 * SSR).
 */
const mindFlowFabricBrowserEntry = fileURLToPath(
  new URL('../mindapp-fabric/lib/index.es.js', import.meta.url),
);

export default defineProject({
  plugins: [solid()],
  resolve: {
    alias: { '@bemedev/mind-flow-fabric': mindFlowFabricBrowserEntry },
    tsconfigPaths: true,
  },
  test: {
    name: 'mind-machine-fabric',
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
