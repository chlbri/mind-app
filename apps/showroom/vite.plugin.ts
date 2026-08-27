import { execSync } from 'child_process';
import { resolve, isAbsolute } from 'path';

import { toArray, type SoA } from '@bemedev/app/bemedev';
import { type PluginOption } from 'vite';

export type HmrPluginProps = {
  /** Array of file paths to watch for changes. */
  paths?: SoA<string>;

  /** Array of shell commands to execute when a change is detected. */
  scripts?: SoA<string>;

  /** Optional interval in milliseconds to wait before allowing another build. */
  debounce?: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const normalizePath = (path: string) => path.replace(/\\/g, '/');

export const hmr = (props?: HmrPluginProps): PluginOption => {
  // Lock variable to prevent infinite build loops
  let isBuilding = false;
  const debounce = clamp(props?.debounce ?? 500, 500, 10_000);
  const paths: string[] = [];
  let isDev = false;

  return {
    name: 'hmr-add-on',

    configResolved(config) {
      isDev = !config.isProduction;
      if (!isDev) return;

      // Resolve relative paths based on Vite project root
      const resolvedPaths = toArray
        .typed(props?.paths)
        .map(p => (isAbsolute(p) ? p : resolve(config.root, p)))
        .map(normalizePath);

      paths.push(...resolvedPaths);
    },

    configEnvironment(name) {
      isDev = name === 'dev';
    },

    configureServer(server) {
      if (!isDev) return;

      server.watcher.add(paths);
    },

    handleHotUpdate(ctx) {
      if (!isDev) return;

      // 1. If a build is already in progress, ignore ALL changes (prevents loops)
      if (isBuilding) return ctx.modules;
      const normalizedFile = normalizePath(ctx.file);
      const checks = paths.some(p => normalizedFile.includes(p));

      if (checks) {
        console.log(`\n⚡ External file modified: ${ctx.file}. Starting build...`);

        try {
          // 2. Acquire lock before starting the build
          isBuilding = true;
          const scripts = toArray.typed(props?.scripts);

          ctx.server.moduleGraph.invalidateAll();
          scripts.forEach(script => {
            execSync(script, { stdio: 'inherit' });
          });

          // Invalidate module graph so Vite reads fresh built files from disk
          ctx.server.ws.send({ type: 'full-reload' });
        } catch (error) {
          console.error('❌ Command execution failed during HMR:', error);
        } finally {
          // 3. Once build is complete, wait for the debounce period to allow
          // Vite to ignore generated build files, then release the lock.
          setTimeout(() => {
            isBuilding = false;
            console.log('✅ Build completed. Ready for subsequent changes.');
          }, debounce);
        }
      }

      return ctx.modules;
    },
  };
};
