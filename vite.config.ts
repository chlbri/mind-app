import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json" with { type: "json" };
import { defineConfig } from "vite";
import viteSolid from "vite-plugin-solid";
import dts from "vite-plugin-dts";

const globals = Object.keys({ ...pkg.peerDependencies });

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [dts() as any, tailwindcss() as any, viteSolid()],
  build: {
    outDir: "lib",

    lib: {
      entry: "./src/index.ts",
      name: "ui",
      fileName: (format, entry) => `${entry}.${format}.js`,
      formats: ["es", "cjs", "umd"],
    },

    rollupOptions: {
      external: globals,
      output: {
        globals: globals.reduce(
          (acc, curr) => {
            acc[curr] = curr;
            return acc;
          },
          {} as Record<string, string>,
        ),
      },
    },
  },
});
