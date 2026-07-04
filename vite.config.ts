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
      alias: [
        // Fix pdf-lib on Cloudflare Workers: force ESM build of tslib so
        // __extends/__assign etc are exported properly.
        { find: "tslib", replacement: "tslib/tslib.es6.js" },
        // upng-js CJS does `require("pako")` and calls `pako.inflate`
        // directly. pako v3's ESM build (`pako.mjs`) has no default export,
        // so the CJS→ESM interop returns `{ default: undefined, inflate, ... }`
        // and `pako.inflate` ends up undefined on the required value.
        // Pin the bare specifier to the CJS build so `exports.inflate` is
        // directly available.
        {
          find: /^pako$/,
          replacement: new URL("./node_modules/pako/dist/pako.cjs.js", import.meta.url).pathname,
        },
      ],
    },

    ssr: {
      noExternal: ["pdf-lib", "tslib", "upng-js", "pako", "jpeg-js"],
    },
  },

});
