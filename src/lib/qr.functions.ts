import { createServerFn } from "@tanstack/react-start";

// Generate a QR code as a base64 PNG. Pure-JS, Worker-safe.
export const generateQrPngBase64 = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => {
    if (!data?.text || typeof data.text !== "string") throw new Error("text required");
    if (data.text.length > 2000) throw new Error("text too long");
    return { text: data.text };
  })
  .handler(async ({ data }) => {
    const qrGen = (await import("qrcode-generator")).default;
    const UPNG = (await import("upng-js")).default;

    const qr = qrGen(0, "H");
    qr.addData(data.text, "Byte");
    qr.make();
    const modules: number = qr.getModuleCount();

    const scale = 12;
    const margin = 4;
    const size = (modules + margin * 2) * scale;
    const rgba = new Uint8Array(size * size * 4);
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 255; rgba[i + 1] = 255; rgba[i + 2] = 255; rgba[i + 3] = 255;
    }
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (!qr.isDark(r, c)) continue;
        const x0 = (c + margin) * scale;
        const y0 = (r + margin) * scale;
        for (let dy = 0; dy < scale; dy++) {
          const row = (y0 + dy) * size;
          for (let dx = 0; dx < scale; dx++) {
            const idx = (row + x0 + dx) * 4;
            rgba[idx] = 0; rgba[idx + 1] = 0; rgba[idx + 2] = 0; rgba[idx + 3] = 255;
          }
        }
      }
    }
    const png: ArrayBuffer = UPNG.encode([rgba.buffer], size, size, 0);
    // Base64 encode
    const bytes = new Uint8Array(png);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    // eslint-disable-next-line no-undef
    const b64 = typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
    return { base64: b64, mime: "image/png" };
  });

// Scan a QR code from a base64-encoded image (any format the qrserver API supports).
export const scanQrFromBase64 = createServerFn({ method: "POST" })
  .inputValidator((data: { base64: string; mime?: string }) => {
    if (!data?.base64 || typeof data.base64 !== "string") throw new Error("base64 required");
    if (data.base64.length > 15_000_000) throw new Error("image too large");
    return { base64: data.base64, mime: data.mime ?? "image/png" };
  })
  .handler(async ({ data }) => {
    const bin = atob(data.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    // Try local zxing first (works in Worker for common images)
    try {
      const zxing = await import("@sec-ant/zxing-wasm/reader");
      const results = await zxing.readBarcodesFromImageFile(
        new Blob([bytes as unknown as BlobPart], { type: data.mime }),
        {
          formats: ["QRCode", "MicroQRCode"],
          tryHarder: true,
        },
      );
      if (results && results.length && results[0].text) {
        return { text: results[0].text, source: "local" as const };
      }
    } catch (e) {
      // fall through to remote
      console.warn("zxing scan failed", e);
    }

    // Fallback: qrserver.com public API
    try {
      const form = new FormData();
      form.append("file", new Blob([bytes as unknown as BlobPart], { type: data.mime }), "qr");
      const res = await fetch("https://api.qrserver.com/v1/read-qr-code/?MAX_SIZE_HEIGHT=1500", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as Array<{ symbol?: Array<{ data?: string | null }> }>;
      const text = json?.[0]?.symbol?.[0]?.data ?? null;
      if (text) return { text, source: "remote" as const };
    } catch (e) {
      console.warn("qrserver scan failed", e);
    }

    return { text: null, source: null };
  });
