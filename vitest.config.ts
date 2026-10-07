import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { host: '0.0.0.0' },

  test: {
    passWithNoTests: true,
    slowTestThreshold: 3000,
    logHeapUsage: true,
    globals: true,
    typecheck: { enabled: true, ignoreSourceErrors: false },
    env: { NODE_ENV: 'test' },

    coverage: { enabled: true, reportsDirectory: '.coverage', provider: 'v8' },

    projects: [
      'packages/mindapp/vitest.config.ts',
      'packages/mind-machine/vitest.config.ts',
      'packages/mindapp-three/vitest.config.ts',
      'packages/mind-machine-three/vitest.config.ts',
      'packages/mindapp-fabric/vitest.config.ts',
      'packages/mind-machine-fabric/vitest.config.ts',
      'apps/showroom/vitest.config.ts',
    ],
  },
});
