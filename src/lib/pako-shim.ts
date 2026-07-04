// upng-js does `import pako from "pako"` but pako v3 ESM has no default
// export. Read the ESM file via absolute path to sidestep the package's
// exports field (which forbids deep imports).
// @ts-expect-error - absolute path import, no types
import * as pako from "/dev-server/node_modules/pako/dist/pako.mjs";
export default pako;
