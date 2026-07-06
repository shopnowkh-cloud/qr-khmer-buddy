import { createServerFn } from "@tanstack/react-start";

const KEY_R = 255, KEY_G = 0, KEY_B = 255;

async function decodeToRgba(bytes: ArrayBuffer, mime: string) {
  try {
    const buf = Buffer.from(bytes);
    if (mime.includes("png") || (buf[0] === 0x89 && buf[1] === 0x50)) {
      const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
      const img = UPNG.decode(buf);
      return { rgba: new Uint8Array(UPNG.toRGBA8(img)[0]), w: img.width, h: img.height };
    }
    const jpeg = (await import("jpeg-js")) as unknown as {
      decode: (b: Buffer, o: { useTArray: true }) => { data: Uint8Array; width: number; height: number };
    };
    const d = jpeg.decode(buf, { useTArray: true });
    return { rgba: new Uint8Array(d.data), w: d.width, h: d.height };
  } catch (e) {
    console.error("decodeToRgba error", e);
    return null;
  }
}

function isGraphicOnWhite(rgba: Uint8Array): boolean {
  let white = 0, dark = 0, colorful = 0, n = 0;
  for (let i = 0; i < rgba.length; i += 16) {
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (min > 215) white++;
    else if (max < 90) dark++;
    else if (max - min > 60) colorful++;
    n++;
  }
  return n > 0 && white / n > 0.25 && (white + dark) / n > 0.7 && colorful / n < 0.1;
}

async function whiteToTransparent(rgba: Uint8Array, w: number, h: number) {
  try {
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
    const out = new Uint8Array(rgba);
    const INNER = 232, OUTER = 200;
    for (let i = 0; i < out.length; i += 4) {
      const min = Math.min(out[i], out[i + 1], out[i + 2]);
      if (min >= INNER) out[i + 3] = 0;
      else if (min > OUTER) out[i + 3] = Math.round(255 * ((INNER - min) / (INNER - OUTER)));
    }
    return new Uint8Array(UPNG.encode([out.buffer], w, h, 0));
  } catch (e) { console.error("whiteToTransparent", e); return null; }
}

async function keepIfAlreadyTransparent(pngBytes: Buffer) {
  try {
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
    const img = UPNG.decode(pngBytes);
    const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
    let transparent = 0;
    const total = rgba.length / 4;
    for (let i = 3; i < rgba.length; i += 4) if (rgba[i] < 10) transparent++;
    if (total > 0 && transparent / total >= 0.02)
      return new Uint8Array(UPNG.encode([rgba.buffer], img.width, img.height, 0));
    return null;
  } catch { return null; }
}

async function chromaKeyToTransparent(pngBytes: Buffer) {
  try {
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
    const img = UPNG.decode(pngBytes);
    const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
    const w = img.width, h = img.height;
    const INNER = 60, OUTER = 110;
    let cleared = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const dr = r - KEY_R, dg = g - KEY_G, db = b - KEY_B;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist <= INNER) { rgba[i + 3] = 0; cleared++; }
      else if (dist < OUTER) {
        const t = (dist - INNER) / (OUTER - INNER);
        rgba[i + 3] = Math.round(255 * t);
        const spill = 1 - t;
        rgba[i]     = Math.max(0, Math.min(255, r - Math.round(spill * 40)));
        rgba[i + 2] = Math.max(0, Math.min(255, b - Math.round(spill * 40)));
      }
    }
    const total = rgba.length / 4;
    if (total === 0 || cleared / total < 0.02) return null;
    return new Uint8Array(UPNG.encode([rgba.buffer], w, h, 0));
  } catch (e) { console.error("chroma", e); return null; }
}

async function reencodeAsPng(bytes: ArrayBuffer, mime: string) {
  const decoded = await decodeToRgba(bytes, mime);
  if (!decoded) return null;
  const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
  return new Uint8Array(UPNG.encode([decoded.rgba.buffer], decoded.w, decoded.h, 0));
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...(bytes.subarray(i, i + chunk) as unknown as number[]));
  }
  return typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
}

export const removeBgFromBase64 = createServerFn({ method: "POST" })
  .inputValidator((data: { base64: string; mime?: string }) => {
    if (!data?.base64 || typeof data.base64 !== "string") throw new Error("base64 required");
    if (data.base64.length > 20_000_000) throw new Error("image too large");
    return { base64: data.base64, mime: data.mime ?? "image/png" };
  })
  .handler(async ({ data }) => {
    const bytes = b64ToBytes(data.base64);
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

    // Path 1: graphic on white → lossless local key
    const decoded = await decodeToRgba(ab, data.mime);
    if (decoded && isGraphicOnWhite(decoded.rgba)) {
      const local = await whiteToTransparent(decoded.rgba, decoded.w, decoded.h);
      if (local) return { base64: bytesToB64(local), method: "local" as const };
    }

    // Path 2: AI matte
    try {
      const b64 = bytesToB64(bytes);
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Return the SAME image at the SAME resolution as a PNG with a fully TRANSPARENT background: keep the main subject exactly as-is (identical colors, details, and anti-aliased edges), and replace every non-subject pixel with a single flat pure magenta rgb(255,0,255) — #FF00FF. No gradient, texture, checkerboard, shadow, or watermark. Every non-subject pixel must be exactly rgb(255,0,255) OR fully transparent alpha=0." },
              { type: "image_url", image_url: { url: `data:${data.mime};base64,${b64}` } },
            ],
          }],
          modalities: ["image", "text"],
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
        };
        const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) {
          const comma = url.indexOf(",");
          const raw = Buffer.from(comma >= 0 ? url.slice(comma + 1) : url, "base64");
          const pass = await keepIfAlreadyTransparent(raw);
          if (pass) return { base64: bytesToB64(pass), method: "ai" as const };
          const keyed = await chromaKeyToTransparent(raw);
          if (keyed) return { base64: bytesToB64(keyed), method: "ai" as const };
        }
      } else {
        console.error("removebg gateway", res.status, await res.text());
      }
    } catch (e) { console.error("removebg ai", e); }

    // Fallback: aggressive white key
    if (decoded) {
      const forced = await whiteToTransparent(decoded.rgba, decoded.w, decoded.h);
      if (forced) return { base64: bytesToB64(forced), method: "fallback" as const };
    }
    // Last resort: re-encode as PNG
    const png = await reencodeAsPng(ab, data.mime);
    if (png) return { base64: bytesToB64(png), method: "passthrough" as const };
    throw new Error("Failed to process image");
  });
