// upng-js does `import pako from "pako"` but pako v3 ESM has no default export.
// Re-export the namespace as default so upng-js's default import works.
// @ts-expect-error - deep import into pako, no type declarations
import * as pako from "pako/dist/pako.mjs";
export default pako;
