import { execSync } from 'child_process';
import { resolve, isAbsolute } from 'path';

import { toArray, type SoA } from '@bemedev/app/bemedev';
import { type PluginOption } from 'vite';

export type HmrPluginProps = {
  /**
   * Map of watched file/directory paths to one or many shell commands to execute
   * when changes are detected.
   */
  paths?: Record<string, SoA<string>>;

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
  const pathMap = new Map<string, string[]>();
  let isDev = false;

  return {
    name: 'hmr-add-on',

    configResolved(config) {
      isDev = !config.isProduction;
      if (!isDev) return;

      pathMap.clear();
      const rawPaths = props?.paths ?? {};

      Object.entries(rawPaths).forEach(([pathKey, rawScripts]) => {
        const resolved = isAbsolute(pathKey)
          ? pathKey
          : resolve(config.root, pathKey);
        const normalized = normalizePath(resolved);
        const scripts = toArray.typed(rawScripts);
        pathMap.set(normalized, scripts);
      });
    },

    configureServer(server) {
      if (!isDev) return;

      server.watcher.add(Array.from(pathMap.keys()));
    },

    handleHotUpdate(ctx) {
      if (!isDev) return;

      // 1. If a build is already in progress, ignore ALL changes (prevents loops)
      if (isBuilding) return ctx.modules;
      const normalizedFile = normalizePath(ctx.file);

      // Find all matching path entries for the changed file
      const matchingScripts = new Set<string>();
      for (const [watchedPath, scripts] of pathMap.entries()) {
        if (normalizedFile.includes(watchedPath)) {
          scripts.forEach(d => matchingScripts.add(d));
        }
      }

      if (matchingScripts.size > 0) {
        console.log(`\n⚡ External file modified: ${ctx.file}. Starting build...`);

        try {
          // 2. Acquire lock before starting the build
          isBuilding = true;

          // Invalidate module graph so Vite reads fresh built files from disk
          ctx.server.moduleGraph.invalidateAll();
          matchingScripts.forEach(script => execSync(script, { stdio: 'inherit' }));
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
