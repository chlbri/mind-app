import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss({
      
    }),
    tanstackStart({}),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    viteSolid({ ssr: true }) as any,
    nitro({}),
  ],
  nitro: {},
});
