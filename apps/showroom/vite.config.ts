import { suppressWarnings, hmr } from '@bemedev/dev-utils/plugins';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    hmr({
      paths: {
        '../../packages/mindapp/src': 'pnpm run --filter @bemedev/mind-flow build',
        '../../packages/mind-machine/src':
          'pnpm run --filter @bemedev/mind-machine build',
        '../../packages/mindapp-three/src':
          'pnpm run --filter @bemedev/mind-flow-three build',
        '../../packages/mind-machine-three/src':
          'pnpm run --filter @bemedev/mind-machine-three build',
        '../../packages/mindapp-fabric/src':
          'pnpm run --filter @bemedev/mind-flow-fabric build',
        '../../packages/mind-machine-fabric/src':
          'pnpm run --filter @bemedev/mind-machine-fabric build',
      },
      debounce: 1000,
    }),

    suppressWarnings('Cannot remove nonexistent sensor with id'),
    tailwindcss({}),
    tanstackStart({}),
    nitro({}),
    viteSolid({ ssr: true, extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
  ],
});
