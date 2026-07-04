// upng-js does `import pako from "pako"` but pako v3 ESM has no default export.
// The vite alias only rewrites the bare "pako" specifier, so this deep import
// resolves to the real ESM module.
// @ts-expect-error - deep path import, no types
import * as pako from "pako/dist/pako.mjs";
export default pako;
