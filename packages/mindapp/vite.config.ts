import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

const peerDependencies = Object.keys({ ...pkg.peerDependencies });

export default defineConfig(({ mode }) => {
  const isServer =
    mode === 'server' ||
    mode === 'ssr' ||
    process.env.BUILD_TARGET === 'server';
  const entryName = isServer ? 'server' : 'index';

  return {
    resolve: {
      tsconfigPaths: true,
      conditions: isServer ? ['node', 'solid'] : ['browser', 'solid'],
    },

    plugins: [
      !isServer && (dts() as any),
      !isServer && (tailwindcss() as any),

      viteSolid({
        solid: { generate: isServer ? 'ssr' : 'dom', hydratable: true },
      }),
    ].filter(Boolean),

    build: {
      outDir: 'lib',
      emptyOutDir: isServer,
      ssr: isServer,

      lib: {
        entry: './src/index.ts',
        name: 'ui',
        fileName: format => `${entryName}.${format}.js`,
        formats: ['es', 'cjs'],
      },

      rollupOptions: {
        output: isServer
          ? [
              { format: 'es', entryFileNames: 'server.es.js' },
              { format: 'cjs', entryFileNames: 'server.cjs.js' },
            ]
          : undefined,

        external: id => {
          return peerDependencies.some(dep => {
            const out = id === dep || id.startsWith(`${dep}/`);
            if (out) console.log('External', '=>', id);
            return out;
          });
        },
      },
    },
  };
});
