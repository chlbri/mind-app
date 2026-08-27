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
      paths: ['../../packages/mindapp/src'],
      scripts: ['pnpm run --filter @bemedev/mind-flow build'],
      debounce: 1000,
    }),
    suppressWarnings('Cannot remove nonexistent sensor with id'),
    tailwindcss({}),
    tanstackStart({}),
    nitro({}),
    viteSolid({ ssr: true, extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
  ],
});
