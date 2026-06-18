import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

function deriveWebhookSecret(key: string) {
  return createHash("sha256").update(`telegram-webhook:${key}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

async function tg(method: string, body: unknown) {
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": process.env.TELEGRAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function tgSendPhotoUrl(chat_id: number, photoUrl: string, caption?: string) {
  return tg("sendPhoto", { chat_id, photo: photoUrl, caption, parse_mode: "HTML" });
}

async function tgSendMessage(chat_id: number, text: string) {
  return tg("sendMessage", { chat_id, text, parse_mode: "HTML" });
}

const T = {
  generated: "✅ នេះគឺ QR Code របស់អ្នក",
  scanError: "❌ មិនអាចអាន QR Code ពីរូបនេះទេ។ សូមផ្ញើរូបច្បាស់ៗម្តងទៀត។",
  scanFail: "❌ មានបញ្ហាក្នុងការស្កេន។ សូមព្យាយាមម្តងទៀត។",
};

function buildQrUrl(text: string) {
  const params = new URLSearchParams({
    data: text,
    size: "400x400",
    color: "000000",
    bgcolor: "ffffff",
    format: "png",
    ecc: "M",
    margin: "2",
    qzone: "2",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

async function scanWithQrserver(bytes: ArrayBuffer): Promise<string | null> {
  const form = new FormData();
  form.append("file", new Blob([bytes]), "qr.png");
  const res = await fetch("https://api.qrserver.com/v1/read-qr-code/?MAX_SIZE_HEIGHT=1500", {
    method: "POST",
    body: form,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    symbol: Array<{ data: string | null; error: string | null }>;
  }>;
  const sym = data?.[0]?.symbol?.[0];
  if (!sym || sym.error || !sym.data) return null;
  return sym.data;
}

async function scanWithZxing(bytes: ArrayBuffer): Promise<string | null> {
  try {
    const { readBarcodesFromImageFile } = await import("@sec-ant/zxing-wasm/reader");
    const blob = new Blob([bytes]);
    // Try multiple binarizers to handle blur/low-light
    const tryOpts = [
      { tryHarder: true, tryInvert: true, tryDownscale: true, binarizer: "LocalAverage" as const },
      { tryHarder: true, tryInvert: true, tryDownscale: true, binarizer: "GlobalHistogram" as const },
      { tryHarder: true, tryInvert: true, tryDownscale: true, binarizer: "FixedThreshold" as const },
    ];
    for (const opts of tryOpts) {
      const results = await readBarcodesFromImageFile(blob, {
        formats: ["QRCode", "MicroQRCode"],
        ...opts,
      });
      const r = results?.[0];
      if (r?.text) return r.text;
    }
  } catch (e) {
    console.error("zxing scan error", e);
  }
  return null;
}

async function scanQrFromTelegramFile(fileId: string): Promise<string | null> {
  const fileInfo = (await tg("getFile", { file_id: fileId })) as {
    ok: boolean;
    result?: { file_path: string };
  };
  if (!fileInfo.ok || !fileInfo.result?.file_path) return null;

  const dl = await fetch(`${GATEWAY_URL}/file/${fileInfo.result.file_path}`, {
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": process.env.TELEGRAM_API_KEY!,
    },
  });
  if (!dl.ok) return null;
  const bytes = await dl.arrayBuffer();

  // Try local zxing-wasm first (robust for blur / low-light), then qrserver fallback
  const local = await scanWithZxing(bytes);
  if (local) return local;
  return await scanWithQrserver(bytes);
}

function escapeHtml(s: string) {
  return s.replace(/[<>&]/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tgKey = process.env.TELEGRAM_API_KEY;
        if (!tgKey || !process.env.LOVABLE_API_KEY) {
          return new Response("Not configured", { status: 500 });
        }

        const expected = deriveWebhookSecret(tgKey);
        const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(got, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let update: any;
        try {
          update = await request.json();
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        try {
          const msg = update.message ?? update.edited_message;
          if (!msg) return Response.json({ ok: true });
          const chatId = msg.chat.id;

          // Photo → scan
          if (msg.photo && Array.isArray(msg.photo) && msg.photo.length) {
            const best = msg.photo[msg.photo.length - 1];
            try {
              const text = await scanQrFromTelegramFile(best.file_id);
              if (!text) await tgSendMessage(chatId, T.scanError);
              else
                await tgSendMessage(
                  chatId,
                  `✅ <b>លទ្ធផល QR Code</b>:\n\n<code>${escapeHtml(text)}</code>`,
                );
            } catch {
              await tgSendMessage(chatId, T.scanFail);
            }
            return Response.json({ ok: true });
          }

          // Document image → scan (jpg/png/webp/heic etc by mime or extension)
          const doc = msg.document;
          const docName: string = doc?.file_name ?? "";
          const isImageDoc =
            !!doc &&
            (/^image\//.test(doc.mime_type ?? "") ||
              /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(docName));
          if (isImageDoc) {
            try {
              const text = await scanQrFromTelegramFile(doc.file_id);
              if (!text) await tgSendMessage(chatId, T.scanError);
              else
                await tgSendMessage(
                  chatId,
                  `✅ <b>លទ្ធផល QR Code</b>:\n\n<code>${escapeHtml(text)}</code>`,
                );
            } catch {
              await tgSendMessage(chatId, T.scanFail);
            }
            return Response.json({ ok: true });
          }

          const text: string = (msg.text ?? "").trim();
          if (text) {
            const url = buildQrUrl(text);
            await tgSendPhotoUrl(chatId, url, T.generated);
          }
        } catch (err) {
          console.error("telegram webhook error", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
