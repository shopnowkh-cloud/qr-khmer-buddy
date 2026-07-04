// upng-js does `import pako from "pako"` but pako v3 ESM has no default export.
// Absolute path bypasses the vite alias on "pako" so we don't recurse into ourselves.
// @ts-expect-error - deep path import, no types
import * as pako from "/dev-server/node_modules/pako/dist/pako.mjs";
export default pako;
