// upng-js does `import pako from "pako"` but pako v3 ESM has no default export.
// Re-export the namespace as default so upng-js's default import works.
import * as pako from "pako/dist/pako.mjs";
export default pako;
export * from "pako/dist/pako.mjs";
