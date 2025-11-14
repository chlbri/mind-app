import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({}),
    nitroV2Plugin({}),
    viteSolid({ ssr: true }) as any,
    tailwindcss(),
  ],
});
