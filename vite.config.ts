// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: {
        // Fix pdf-lib on Cloudflare Workers: force ESM build of tslib so
        // __extends/__assign etc are exported properly.
        tslib: "tslib/tslib.es6.js",
        // upng-js does `import pako from "pako"` but pako.mjs has no default
        // export. Point pako to its CJS build which does.
        pako: "pako/dist/pako.cjs.js",
      },
    },
    ssr: {
      noExternal: ["pdf-lib", "tslib", "upng-js", "pako"],
    },
  },

});
