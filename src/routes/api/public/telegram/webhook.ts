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

async function tgSendMessage(chat_id: number, text: string, extra: Record<string, unknown> = {}) {
  return tg("sendMessage", { chat_id, text, parse_mode: "HTML", ...extra });
}

// --- UI (Khmer) ---
const T = {
  welcome:
    "👋 <b>សូមស្វាគមន៍!</b>\n\nបុតនេះអាចជួយអ្នក៖\n• បង្កើត QR Code (មានជម្រើសច្រើន)\n• ស្កេន QR Code ពីរូបភាព\n\nសូមជ្រើសរើសខាងក្រោម៖",
  mainMenu: () => ({
    inline_keyboard: [
      [{ text: "🎨 បង្កើត QR Code", callback_data: "create:menu" }],
      [{ text: "📷 ស្កេន QR Code", callback_data: "scan:start" }],
      [{ text: "ℹ️ ជំនួយ", callback_data: "help" }],
    ],
  }),
  help:
    "<b>របៀបប្រើប្រាស់</b>\n\n🎨 <b>បង្កើត QR</b>: ជ្រើសរើសទំហំ ពណ៌ និងទម្រង់ រួចផ្ញើអត្ថបទ ឬ URL\n\n📷 <b>ស្កេន QR</b>: ផ្ញើរូបភាព QR Code មកបុត បុតនឹងអានវាឱ្យអ្នក",
  scanPrompt: "📷 សូមផ្ញើ <b>រូបភាព</b> QR Code មកខ្ញុំ ខ្ញុំនឹងអានវាឱ្យអ្នក។",
  generated: "✅ នេះគឺ QR Code របស់អ្នក",
  scanError: "❌ មិនអាចអាន QR Code ពីរូបនេះទេ។ សូមផ្ញើរូបច្បាស់ៗម្តងទៀត។",
  scanFail: "❌ មានបញ្ហាក្នុងការស្កេន។ សូមព្យាយាមម្តងទៀត។",
  unknown: "សូមប្រើ /start ដើម្បីបើកម៉ឺនុយ។",
};

const SIZES = [
  { id: "200", label: "តូច (200)" },
  { id: "400", label: "មធ្យម (400)" },
  { id: "800", label: "ធំ (800)" },
];
const COLORS = [
  { id: "000000", label: "⚫ ខ្មៅ" },
  { id: "1e40af", label: "🔵 ខៀវ" },
  { id: "dc2626", label: "🔴 ក្រហម" },
  { id: "16a34a", label: "🟢 បៃតង" },
  { id: "7c3aed", label: "🟣 ស្វាយ" },
];
const FORMATS = [
  { id: "png", label: "PNG" },
  { id: "svg", label: "SVG" },
  { id: "jpg", label: "JPG" },
];
const ECCS = [
  { id: "L", label: "L (ទាប)" },
  { id: "M", label: "M (មធ្យម)" },
  { id: "Q", label: "Q (ខ្ពស់)" },
  { id: "H", label: "H (ខ្ពស់បំផុត)" },
];

type Opts = { size: string; color: string; format: string; ecc: string };
const DEFAULT_OPTS: Opts = { size: "400", color: "000000", format: "png", ecc: "M" };

function parseOpts(data: string): Opts {
  // create:s=400:c=000000:f=png:e=M
  const o = { ...DEFAULT_OPTS };
  for (const part of data.split(":")) {
    const [k, v] = part.split("=");
    if (k === "s") o.size = v;
    if (k === "c") o.color = v;
    if (k === "f") o.format = v;
    if (k === "e") o.ecc = v;
  }
  return o;
}
function encodeOpts(o: Opts) {
  return `s=${o.size}:c=${o.color}:f=${o.format}:e=${o.ecc}`;
}

function buildKeyboard(o: Opts) {
  const mark = (active: boolean, label: string) => (active ? `✅ ${label}` : label);
  const base = encodeOpts(o);
  const setRow = (field: keyof Opts, items: { id: string; label: string }[]) =>
    items.map((it) => {
      const newOpts = { ...o, [field]: it.id };
      return {
        text: mark(o[field] === it.id, it.label),
        callback_data: `set:${encodeOpts(newOpts)}`,
      };
    });

  return {
    inline_keyboard: [
      [{ text: "── ទំហំ ──", callback_data: "noop" }],
      setRow("size", SIZES),
      [{ text: "── ពណ៌ ──", callback_data: "noop" }],
      setRow("color", COLORS).slice(0, 3),
      setRow("color", COLORS).slice(3),
      [{ text: "── ទម្រង់ ──", callback_data: "noop" }],
      setRow("format", FORMATS),
      [{ text: "── កម្រិតការពារ ──", callback_data: "noop" }],
      setRow("ecc", ECCS),
      [{ text: "✅ បន្ត – ផ្ញើអត្ថបទ", callback_data: `go:${base}` }],
      [{ text: "⬅️ ត្រឡប់", callback_data: "back" }],
    ],
  };
}

function optsSummary(_o: Opts) {
  return `👇`;
}


function buildQrUrl(text: string, o: Opts) {
  const params = new URLSearchParams({
    data: text,
    size: `${o.size}x${o.size}`,
    color: o.color,
    bgcolor: "ffffff",
    format: o.format,
    ecc: o.ecc,
    margin: "2",
    qzone: "2",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
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

  const form = new FormData();
  form.append("file", new Blob([bytes]), "qr.jpg");
  const res = await fetch("https://api.qrserver.com/v1/read-qr-code/", {
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
          // Callback queries
          if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const msgId = cb.message.message_id;
            const data: string = cb.data ?? "";

            await tg("answerCallbackQuery", { callback_query_id: cb.id });

            if (data === "create:menu") {
              const o = DEFAULT_OPTS;
              await tg("editMessageText", {
                chat_id: chatId,
                message_id: msgId,
                text: optsSummary(o),
                parse_mode: "HTML",
                reply_markup: buildKeyboard(o),
              });
            } else if (data.startsWith("set:")) {
              const o = parseOpts(data.slice(4));
              await tg("editMessageText", {
                chat_id: chatId,
                message_id: msgId,
                text: optsSummary(o),
                parse_mode: "HTML",
                reply_markup: buildKeyboard(o),
              });
            } else if (data.startsWith("go:")) {
              const enc = data.slice(3);
              await tgSendMessage(
                chatId,
                `✍️ សូមផ្ញើ <b>អត្ថបទ</b> ឬ <b>URL</b> ដែលអ្នកចង់បំលែងទៅ QR Code\n\n<code>[opts:${enc}]</code>`,
                {
                  reply_markup: { force_reply: true, selective: true },
                },
              );
            } else if (data === "scan:start") {
              await tgSendMessage(chatId, T.scanPrompt);
            } else if (data === "help") {
              await tg("editMessageText", {
                chat_id: chatId,
                message_id: msgId,
                text: T.help,
                parse_mode: "HTML",
                reply_markup: T.mainMenu(),
              });
            } else if (data === "back") {
              await tg("editMessageText", {
                chat_id: chatId,
                message_id: msgId,
                text: T.welcome,
                parse_mode: "HTML",
                reply_markup: T.mainMenu(),
              });
            }
            return Response.json({ ok: true });
          }

          const msg = update.message ?? update.edited_message;
          if (!msg) return Response.json({ ok: true });
          const chatId = msg.chat.id;

          // Photo → scan
          if (msg.photo && Array.isArray(msg.photo) && msg.photo.length) {
            const best = msg.photo[msg.photo.length - 1];
            await tgSendMessage(chatId, "⏳ កំពុងស្កេន...");
            try {
              const text = await scanQrFromTelegramFile(best.file_id);
              if (!text) {
                await tgSendMessage(chatId, T.scanError);
              } else {
                const safe = text.replace(/[<>&]/g, (c) =>
                  c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
                );
                await tgSendMessage(
                  chatId,
                  `✅ <b>លទ្ធផល QR Code</b>:\n\n<code>${safe}</code>`,
                );
              }
            } catch {
              await tgSendMessage(chatId, T.scanFail);
            }
            return Response.json({ ok: true });
          }

          // Document image → scan
          if (msg.document && /^image\//.test(msg.document.mime_type ?? "")) {
            await tgSendMessage(chatId, "⏳ កំពុងស្កេន...");
            const text = await scanQrFromTelegramFile(msg.document.file_id);
            if (!text) await tgSendMessage(chatId, T.scanError);
            else {
              const safe = text.replace(/[<>&]/g, (c) =>
                c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
              );
              await tgSendMessage(
                chatId,
                `✅ <b>លទ្ធផល QR Code</b>:\n\n<code>${safe}</code>`,
              );
            }
            return Response.json({ ok: true });
          }

          const text: string = msg.text ?? "";

          // Reply to options prompt → generate QR
          const replyText: string | undefined = msg.reply_to_message?.text;
          const optsMatch = replyText?.match(/\[opts:([^\]]+)\]/);
          if (optsMatch && text) {
            const o = parseOpts(optsMatch[1]);
            const url = buildQrUrl(text, o);
            if (o.format === "svg") {
              await tgSendMessage(chatId, `✅ QR Code (SVG): ${url}`);
            } else {
              await tgSendPhotoUrl(chatId, url, T.generated);
            }
            return Response.json({ ok: true });
          }

          if (text.startsWith("/start")) {
            await tgSendMessage(chatId, T.welcome, { reply_markup: T.mainMenu() });
          } else if (text) {
            // Treat plain text as quick QR with default opts
            const url = buildQrUrl(text, DEFAULT_OPTS);
            await tgSendPhotoUrl(chatId, url, T.generated);
          } else {
            await tgSendMessage(chatId, T.unknown);
          }
        } catch (err) {
          console.error("telegram webhook error", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
