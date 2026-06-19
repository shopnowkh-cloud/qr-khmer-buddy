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

async function tgSendPhotoUrl(
  chat_id: number,
  photoUrl: string,
  caption?: string,
  reply_to?: number,
  reply_markup?: unknown,
) {
  return tg("sendPhoto", {
    chat_id,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
    ...(reply_to ? { reply_parameters: { message_id: reply_to, allow_sending_without_reply: true } } : {}),
    ...(reply_markup ? { reply_markup } : {}),
  });
}

async function tgSendMessage(chat_id: number, text: string, reply_to?: number) {
  return tg("sendMessage", {
    chat_id,
    text,
    parse_mode: "HTML",
    ...(reply_to ? { reply_parameters: { message_id: reply_to, allow_sending_without_reply: true } } : {}),
  });
}

async function tgSetReaction(chat_id: number, message_id: number, emoji: string) {
  return tg("setMessageReaction", {
    chat_id,
    message_id,
    reaction: [{ type: "emoji", emoji }],
    is_big: true,
  });
}

async function tgTyping(chat_id: number, action: "typing" | "upload_photo" = "typing") {
  return tg("sendChatAction", { chat_id, action });
}

const WELCOME_REACTIONS = [
  "👍", "❤️", "🔥", "🥳", "👏", "😎", "🤩", "🎉", "✨", "🚀",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const T = {
  welcome:
    "👋 <b>សួស្តី! សូមស្វាគមន៍មកកាន់ QR Code Bot</b>\n\n" +
    "<b>🤖 មុខងាររបស់បូត៖</b>\n\n" +
    "1️⃣ <b>បង្កើត QR Code</b>\n" +
    "• សរសេរអក្សរ ឬតំណណាមួយ → បូតនឹងបង្កើត QR Code ឲ្យអ្នក\n\n" +
    "2️⃣ <b>ស្កេន QR Code</b>\n" +
    "• ផ្ញើរូបថត ឬឯកសារ (JPG/PNG/WEBP) → បូតនឹងអាន QR Code ហើយបង្ហាញលទ្ធផល\n\n" +
    "<i>💡 គ្រាន់តែផ្ញើអក្សរឬរូបភាព ហើយបូតនឹងដោះស្រាយដោយស្វ័យប្រវត្តិ!</i>",
  generated: "",
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
          // Inline mode: @bot <query> → return a QR Code result
          if (update.inline_query) {
            const iq = update.inline_query;
            const q: string = (iq.query ?? "").trim();
            if (!q) {
              await tg("answerInlineQuery", {
                inline_query_id: iq.id,
                results: [],
                cache_time: 1,
                is_personal: true,
                button: {
                  text: "សរសេរអក្សរណាមួយដើម្បីបង្កើត QR Code",
                  start_parameter: "start",
                },
              });
              return Response.json({ ok: true });
            }
            const qrUrl = buildQrUrl(q);
            const preview = q.length > 60 ? q.slice(0, 60) + "…" : q;
            await tg("answerInlineQuery", {
              inline_query_id: iq.id,
              cache_time: 0,
              is_personal: true,
              results: [
                {
                  type: "photo",
                  id: "qr_" + Date.now().toString(36),
                  photo_url: qrUrl,
                  thumbnail_url: qrUrl,
                  photo_width: 400,
                  photo_height: 400,
                  title: "QR Code",
                  description: preview,
                  caption: `<code>${escapeHtml(q)}</code>`,
                  parse_mode: "HTML",
                },
              ],
            });
            return Response.json({ ok: true });
          }

          const msg = update.message ?? update.edited_message;
          if (!msg) return Response.json({ ok: true });
          const chatId = msg.chat.id;
          const msgId: number = msg.message_id;

          // Photo → scan
          if (msg.photo && Array.isArray(msg.photo) && msg.photo.length) {
            const best = msg.photo[msg.photo.length - 1];
            await tgTyping(chatId, "typing");
            try {
              const text = await scanQrFromTelegramFile(best.file_id);
              if (!text) await tgSendMessage(chatId, T.scanError, msgId);
              else
                await tgSendMessage(
                  chatId,
                  `<code>${escapeHtml(text)}</code>`,
                  msgId,
                );
            } catch {
              await tgSendMessage(chatId, T.scanFail, msgId);
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
            await tgTyping(chatId, "typing");
            try {
              const text = await scanQrFromTelegramFile(doc.file_id);
              if (!text) await tgSendMessage(chatId, T.scanError, msgId);
              else
                await tgSendMessage(
                  chatId,
                  `<code>${escapeHtml(text)}</code>`,
                  msgId,
                );
            } catch {
              await tgSendMessage(chatId, T.scanFail, msgId);
            }
            return Response.json({ ok: true });
          }

          const text: string = (msg.text ?? "").trim();
          if (text === "/start") {
            await tgTyping(chatId, "typing");
            const welcomeRes = (await tgSendMessage(chatId, T.welcome, msgId)) as {
              ok: boolean;
              result?: { message_id: number };
            };
            if (welcomeRes.ok && welcomeRes.result?.message_id) {
              await tgSetReaction(chatId, welcomeRes.result.message_id, pickRandom(WELCOME_REACTIONS));
            }
            return Response.json({ ok: true });
          }
          if (text) {
            await tgTyping(chatId, "upload_photo");
            const url = buildQrUrl(text);
            const shareMarkup = {
              inline_keyboard: [
                [
                  {
                    text: "📤 ផ្ញើទៅជជែកផ្សេង",
                    switch_inline_query: text,
                  },
                ],
              ],
            };
            await tgSendPhotoUrl(chatId, url, T.generated, msgId, shareMarkup);
          }
        } catch (err) {
          console.error("telegram webhook error", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
