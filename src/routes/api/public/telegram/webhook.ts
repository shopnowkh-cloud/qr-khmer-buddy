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

async function tgSendPhotoBytes(
  chat_id: number,
  bytes: Uint8Array,
  filename: string,
  caption?: string,
  reply_to?: number,
  reply_markup?: unknown,
) {
  const form = new FormData();
  form.append("chat_id", String(chat_id));
  if (caption) {
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
  }
  if (reply_to) {
    form.append(
      "reply_parameters",
      JSON.stringify({ message_id: reply_to, allow_sending_without_reply: true }),
    );
  }
  if (reply_markup) form.append("reply_markup", JSON.stringify(reply_markup));
  form.append("photo", new Blob([bytes as unknown as BlobPart]), filename);
  const res = await fetch(`${GATEWAY_URL}/sendPhoto`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": process.env.TELEGRAM_API_KEY!,
    },
    body: form,
  });
  return res.json();
}

async function tgSendDocumentBytes(
  chat_id: number,
  bytes: Uint8Array,
  filename: string,
  caption?: string,
  reply_to?: number,
  reply_markup?: unknown,
) {
  const form = new FormData();
  form.append("chat_id", String(chat_id));
  if (caption) {
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
  }
  if (reply_to) {
    form.append(
      "reply_parameters",
      JSON.stringify({ message_id: reply_to, allow_sending_without_reply: true }),
    );
  }
  if (reply_markup) form.append("reply_markup", JSON.stringify(reply_markup));
  form.append("document", new Blob([bytes as unknown as BlobPart]), filename);
  const res = await fetch(`${GATEWAY_URL}/sendDocument`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": process.env.TELEGRAM_API_KEY!,
    },
    body: form,
  });
  return res.json();
}

async function tgSendAudioBytes(
  chat_id: number,
  bytes: Uint8Array,
  filename: string,
  caption?: string,
  reply_to?: number,
  reply_markup?: unknown,
) {
  const form = new FormData();
  form.append("chat_id", String(chat_id));
  if (caption) {
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
  }
  if (reply_to) {
    form.append(
      "reply_parameters",
      JSON.stringify({ message_id: reply_to, allow_sending_without_reply: true }),
    );
  }
  if (reply_markup) form.append("reply_markup", JSON.stringify(reply_markup));
  form.append("audio", new Blob([bytes as unknown as BlobPart], { type: "audio/mpeg" }), filename);
  const res = await fetch(`${GATEWAY_URL}/sendAudio`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": process.env.TELEGRAM_API_KEY!,
    },
    body: form,
  });
  return res.json();
}


async function tgSendMessage(
  chat_id: number,
  text: string,
  reply_to?: number,
  reply_markup?: unknown,
  message_effect_id?: string,
) {
  return tg("sendMessage", {
    chat_id,
    text,
    parse_mode: "HTML",
    ...(reply_to ? { reply_parameters: { message_id: reply_to, allow_sending_without_reply: true } } : {}),
    ...(reply_markup ? { reply_markup } : {}),
    ...(message_effect_id ? { message_effect_id } : {}),
  });
}

async function tgTyping(chat_id: number, action: "typing" | "upload_photo" | "upload_document" = "typing") {
  return tg("sendChatAction", { chat_id, action });
}

const MESSAGE_EFFECTS = [
  "5104841245755180586", // 🔥
  "5107584321108051014", // 👍
  "5159385139981059251", // ❤️
  "5046509860389126442", // 🎉
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========== Menu / Keyboards ==========
const BTN = {
  qr: "📱 QR Code",
  removebg: "🖼️ Remove BG",
  pdf: "📄 PDF Tools",
  shorturl: "🔗 Short URL",
  tts: "🔊 សំឡេង (TTS)",
  ocr: "🔍 OCR",
  translate: "🌐 បកប្រែ",
  currency: "💱 USD⇄KHR",
  imgconv: "🎨 ប្តូរ Format",
  help: "ℹ️ ជំនួយ",
  img2pdf: "🖼️→📄 រូបភាព→PDF",
  pdf2img: "📄→🖼️ PDF→រូបភាព",
  mergepdf: "➕ បញ្ចូល PDF",
  compresspdf: "📉 បង្រួម PDF",
  pdftext: "📝 អាន text ពី PDF",
  back: "⬅️ ត្រឡប់",
  done: "✅ បញ្ចប់",
  cancel: "❌ បោះបង់",
  fmtPng: "→ PNG",
  fmtJpg: "→ JPG",
  fmtWebp: "→ WEBP",
};

const mainKeyboard = {
  keyboard: [
    [{ text: BTN.qr }, { text: BTN.removebg }],
    [{ text: BTN.pdf }, { text: BTN.imgconv }],
    [{ text: BTN.tts }, { text: BTN.ocr }],
    [{ text: BTN.translate }, { text: BTN.currency }],
    [{ text: BTN.shorturl }, { text: BTN.help }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const pdfKeyboard = {
  keyboard: [
    [{ text: BTN.img2pdf }, { text: BTN.pdf2img }],
    [{ text: BTN.mergepdf }, { text: BTN.compresspdf }],
    [{ text: BTN.pdftext }],
    [{ text: BTN.back }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const collectKeyboard = {
  keyboard: [[{ text: BTN.done }, { text: BTN.cancel }]],
  resize_keyboard: true,
  is_persistent: true,
};

const imgFmtKeyboard = {
  keyboard: [
    [{ text: BTN.fmtPng }, { text: BTN.fmtJpg }, { text: BTN.fmtWebp }],
    [{ text: BTN.back }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

// ========== Text ==========
const T = {
  welcome:
    "👋 <b>សួស្តី! សូមស្វាគមន៍មកកាន់ Multi-Tool Bot</b>\n\n" +
    "<b>🤖 មុខងារ៖</b>\n" +
    "📱 QR Code | 🖼️ Remove BG\n" +
    "📄 PDF Tools | 🎨 Image Format\n" +
    "🔊 TTS សំឡេង | 🔍 OCR អានអក្សរ\n" +
    "🌐 បកប្រែ | 💱 USD⇄KHR | 🔗 Short URL\n\n" +
    "<i>💡 ជ្រើសរើសមុខងារពី keyboard ខាងក្រោម!</i>",
  qrMode:
    "📱 <b>QR Code Mode</b>\n\n" +
    "• សរសេរអក្សរ ឬតំណ → បង្កើត QR\n" +
    "• ផ្ញើរូបភាព → ស្កេន QR",
  removebgMode: "🖼️ <b>Remove Background</b>\n\nផ្ញើរូបភាព ដើម្បីលុប background",
  shorturlMode: "🔗 <b>Short URL</b>\n\nផ្ញើតំណ (URL) ដើម្បីបង្រួម",
  pdfMenu: "📄 <b>PDF Tools</b>\n\nជ្រើសរើសមុខងារ៖",
  img2pdfMode: "🖼️→📄 <b>រូបភាព → PDF</b>\n\nផ្ញើរូបភាពមួយ ឬច្រើន រួចចុច <b>✅ បញ្ចប់</b>",
  mergeMode: "➕ <b>បញ្ចូល PDF</b>\n\nផ្ញើ PDF ចាប់ពី 2 ឯកសារឡើងទៅ រួចចុច <b>✅ បញ្ចប់</b>",
  compressMode: "📉 <b>បង្រួម PDF</b>\n\nផ្ញើឯកសារ PDF មួយ",
  pdf2imgMode: "📄→🖼️ <b>PDF → រូបភាព</b>\n\nផ្ញើឯកសារ PDF",
  pdfTextMode: "📝 <b>អានអក្សរពី PDF</b>\n\nផ្ញើឯកសារ PDF",
  ttsMode: "🔊 <b>Text to Speech</b>\n\nសរសេរអក្សរ (ខ្មែរ ឬ អង់គ្លេស) → បម្លែងទៅ MP3",
  ocrMode: "🔍 <b>OCR</b>\n\nផ្ញើរូបភាព → អានអក្សរចេញពីរូប",
  translateMode: "🌐 <b>បកប្រែ</b>\n\nសរសេរអក្សរ → បកប្រែស្វ័យប្រវត្តិ ខ្មែរ ⇄ អង់គ្លេស",
  currencyMode:
    "💱 <b>USD ⇄ KHR</b>\n\nឧទាហរណ៍៖ <code>10 usd</code> ឬ <code>50000 khr</code>",
  imgconvMode: "🎨 <b>ប្តូរ Format រូបភាព</b>\n\nផ្ញើរូបភាព រួចជ្រើសរើស format",
  scanError: "❌ មិនអាចអាន QR Code ពីរូបនេះទេ",
  scanFail: "❌ មានបញ្ហាក្នុងការស្កេន",
  cancelled: "❌ បានបោះបង់",
  empty: "⚠️ មិនទាន់មានឯកសារ",
  wrongType: "⚠️ ប្រភេទឯកសារមិនត្រឹមត្រូវ",
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

async function downloadTgFile(fileId: string): Promise<{ bytes: ArrayBuffer; path: string } | null> {
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
  return { bytes: await dl.arrayBuffer(), path: fileInfo.result.file_path };
}

async function scanQrFromTelegramFile(fileId: string): Promise<string | null> {
  const f = await downloadTgFile(fileId);
  if (!f) return null;
  const local = await scanWithZxing(f.bytes);
  if (local) return local;
  return await scanWithQrserver(f.bytes);
}

function escapeHtml(s: string) {
  return s.replace(/[<>&]/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
}

// ========== Session State (in-memory, per worker) ==========
type Mode =
  | "qr"
  | "removebg"
  | "shorturl"
  | "pdfmenu"
  | "img2pdf"
  | "pdf2img"
  | "mergepdf"
  | "compresspdf"
  | "pdftext"
  | "tts"
  | "ocr"
  | "translate"
  | "currency"
  | "imgconv"
  | "imgconv_pick";

interface Session {
  mode: Mode;
  buffer: Uint8Array[];
  lastImage?: { bytes: Uint8Array; mime: string };
}
const sessions = new Map<number, Session>();

function getSession(chatId: number): Session {
  let s = sessions.get(chatId);
  if (!s) {
    s = { mode: "qr", buffer: [] };
    sessions.set(chatId, s);
  }
  return s;
}


// ========== Feature: Short URL ==========
async function shortenUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const t = (await res.text()).trim();
    if (t.startsWith("http")) return t;
    return null;
  } catch {
    return null;
  }
}

// ========== Feature: Remove BG via AI Gateway ==========
async function removeBackground(bytes: ArrayBuffer, mime: string): Promise<Uint8Array | null> {
  try {
    const b64 = Buffer.from(bytes).toString("base64");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Remove the background from this image completely. Keep only the main subject with a fully transparent background. Return the edited image as PNG with transparency.",
              },
              { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      console.error("removebg gateway error", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
    };
    const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) return null;
    const comma = url.indexOf(",");
    const base = comma >= 0 ? url.slice(comma + 1) : url;
    return new Uint8Array(Buffer.from(base, "base64"));
  } catch (e) {
    console.error("removebg error", e);
    return null;
  }
}

// ========== Feature: PDF ==========
// pdf-lib is imported dynamically inside handlers to avoid Cloudflare Workers
// ESM/tslib interop crash ("Cannot destructure property '__extends'...")
async function loadPdfLib() {
  return await import("pdf-lib");
}

async function imagesToPdf(images: Uint8Array[]): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib();
  const pdf = await PDFDocument.create();
  for (const bytes of images) {
    let img;
    try {
      img = await pdf.embedPng(bytes);
    } catch {
      try {
        img = await pdf.embedJpg(bytes);
      } catch {
        continue;
      }
    }
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return await pdf.save();
}

async function mergePdfs(pdfs: Uint8Array[]): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  for (const bytes of pdfs) {
    try {
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await out.copyPages(src, src.getPageIndices());
      for (const p of pages) out.addPage(p);
    } catch (e) {
      console.error("merge skip", e);
    }
  }
  return await out.save();
}

async function compressPdf(bytes: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return await src.save({ useObjectStreams: true, addDefaultPage: false });
}

// ========== Feature: TTS via Lovable AI ==========
async function synthesizeSpeech(text: string): Promise<Uint8Array | null> {
  try {
    // Basic language detection: any Khmer codepoint → Khmer voice hint
    const isKhmer = /[\u1780-\u17FF]/.test(text);
    const voice = isKhmer ? "shimmer" : "alloy";
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text.slice(0, 4000),
        voice,
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      console.error("tts error", res.status, await res.text());
      return null;
    }
    return new Uint8Array(await res.arrayBuffer());
  } catch (e) {
    console.error("tts exception", e);
    return null;
  }
}

// ========== Feature: Gemini chat helper ==========
async function geminiText(prompt: string, opts?: { image?: { b64: string; mime: string } }): Promise<string | null> {
  try {
    const content: unknown[] = [{ type: "text", text: prompt }];
    if (opts?.image) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${opts.image.mime};base64,${opts.image.b64}` },
      });
    }
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) {
      console.error("gemini error", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (e) {
    console.error("gemini exception", e);
    return null;
  }
}

// ========== Feature: PDF text extraction ==========
async function extractPdfText(bytes: Uint8Array): Promise<string | null> {
  try {
    const b64 = Buffer.from(bytes).toString("base64");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all text from this PDF. Preserve original language (Khmer or English) and paragraph structure. Return only the extracted text, no commentary." },
              { type: "file", file: { filename: "doc.pdf", file_data: `data:application/pdf;base64,${b64}` } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("pdftext error", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (e) {
    console.error("pdftext exception", e);
    return null;
  }
}

// ========== Feature: Image format conversion via Gemini image edit ==========
async function convertImageFormat(bytes: ArrayBuffer, mime: string, target: "png" | "jpg" | "webp"): Promise<Uint8Array | null> {
  try {
    const b64 = Buffer.from(bytes).toString("base64");
    const targetMime = target === "jpg" ? "JPEG" : target.toUpperCase();
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Return the exact same image, unchanged, encoded as ${targetMime}.` },
              { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
    };
    const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) return null;
    const comma = url.indexOf(",");
    const base = comma >= 0 ? url.slice(comma + 1) : url;
    return new Uint8Array(Buffer.from(base, "base64"));
  } catch (e) {
    console.error("imgconv error", e);
    return null;
  }
}

// ========== Feature: Currency USD⇄KHR ==========
async function convertCurrency(text: string): Promise<string | null> {
  const m = text.match(/^\s*([\d,.]+)\s*(usd|khr|\$|៛)\s*$/i);
  if (!m) return null;
  const amount = parseFloat(m[1].replace(/,/g, ""));
  if (!isFinite(amount)) return null;
  const unit = m[2].toLowerCase();
  const from = unit === "usd" || unit === "$" ? "USD" : "KHR";
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!res.ok) return null;
    const d = (await res.json()) as { rates?: Record<string, number> };
    if (from === "USD") {
      const r = d.rates?.KHR;
      if (!r) return null;
      return `💵 <b>${amount} USD</b> ≈ <b>${(amount * r).toLocaleString("en-US", { maximumFractionDigits: 0 })} ៛ KHR</b>\n<i>Rate: 1 USD = ${r.toFixed(2)} KHR</i>`;
    } else {
      const r = d.rates?.USD;
      if (!r) return null;
      return `💵 <b>${amount.toLocaleString("en-US")} ៛ KHR</b> ≈ <b>$${(amount * r).toFixed(2)} USD</b>\n<i>Rate: 1 KHR = ${r.toFixed(6)} USD</i>`;
    }
  } catch {
    return null;
  }
}


// ========== Main handler ==========
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
          // Inline mode
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
          const chatId: number = msg.chat.id;
          const msgId: number = msg.message_id;
          const session = getSession(chatId);
          const text: string = (msg.text ?? "").trim();

          // ===== Menu / commands handling =====
          if (text === "/start" || text === "/menu") {
            session.mode = "qr";
            session.buffer = [];
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard, pickRandom(MESSAGE_EFFECTS));
            return Response.json({ ok: true });
          }

          if (text === BTN.help) {
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.back) {
            session.mode = "qr";
            session.buffer = [];
            await tgSendMessage(chatId, T.qrMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.cancel) {
            session.buffer = [];
            const wasPdf = ["img2pdf", "pdf2img", "mergepdf", "compresspdf", "pdftext"].includes(session.mode);
            session.mode = wasPdf ? "pdfmenu" : "qr";
            await tgSendMessage(chatId, T.cancelled, msgId, wasPdf ? pdfKeyboard : mainKeyboard);
            return Response.json({ ok: true });
          }

          if (text === BTN.qr) {
            session.mode = "qr";
            session.buffer = [];
            await tgSendMessage(chatId, T.qrMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.removebg) {
            session.mode = "removebg";
            session.buffer = [];
            await tgSendMessage(chatId, T.removebgMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.shorturl) {
            session.mode = "shorturl";
            session.buffer = [];
            await tgSendMessage(chatId, T.shorturlMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.pdf) {
            session.mode = "pdfmenu";
            session.buffer = [];
            await tgSendMessage(chatId, T.pdfMenu, msgId, pdfKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.img2pdf) {
            session.mode = "img2pdf";
            session.buffer = [];
            await tgSendMessage(chatId, T.img2pdfMode, msgId, collectKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.mergepdf) {
            session.mode = "mergepdf";
            session.buffer = [];
            await tgSendMessage(chatId, T.mergeMode, msgId, collectKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.compresspdf) {
            session.mode = "compresspdf";
            session.buffer = [];
            await tgSendMessage(chatId, T.compressMode, msgId, pdfKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.pdf2img) {
            session.mode = "pdf2img";
            session.buffer = [];
            await tgSendMessage(
              chatId,
              "🚧 មុខងារ PDF → រូបភាព កំពុងតែអភិវឌ្ឍន៍។ សូមប្រើ PDF Tools ផ្សេងទៀត។",
              msgId,
              pdfKeyboard,
            );
            return Response.json({ ok: true });
          }
          if (text === BTN.done) {
            if (session.mode === "img2pdf") {
              if (!session.buffer.length) {
                await tgSendMessage(chatId, T.empty, msgId, collectKeyboard);
                return Response.json({ ok: true });
              }
              await tgTyping(chatId, "upload_document");
              const pdf = await imagesToPdf(session.buffer);
              await tgSendDocumentBytes(chatId, pdf, "images.pdf", "✅ រូបភាព → PDF", msgId, pdfKeyboard);
              session.buffer = [];
              session.mode = "pdfmenu";
              return Response.json({ ok: true });
            }
            if (session.mode === "mergepdf") {
              if (session.buffer.length < 2) {
                await tgSendMessage(chatId, "⚠️ ត្រូវការយ៉ាងតិច 2 PDF", msgId, collectKeyboard);
                return Response.json({ ok: true });
              }
              await tgTyping(chatId, "upload_document");
              const pdf = await mergePdfs(session.buffer);
              await tgSendDocumentBytes(chatId, pdf, "merged.pdf", "✅ បញ្ចូល PDF", msgId, pdfKeyboard);
              session.buffer = [];
              session.mode = "pdfmenu";
              return Response.json({ ok: true });
            }
            await tgSendMessage(chatId, T.qrMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }

          // ===== File/photo handling by mode =====
          const photo = msg.photo && Array.isArray(msg.photo) && msg.photo.length
            ? msg.photo[msg.photo.length - 1]
            : null;
          const doc = msg.document;
          const docName: string = doc?.file_name ?? "";
          const docMime: string = doc?.mime_type ?? "";
          const isImageDoc =
            !!doc &&
            (/^image\//.test(docMime) ||
              /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(docName));
          const isPdfDoc =
            !!doc && (docMime === "application/pdf" || /\.pdf$/i.test(docName));

          // Remove BG
          if (session.mode === "removebg" && (photo || isImageDoc)) {
            const fileId = photo ? photo.file_id : doc.file_id;
            const mime = photo ? "image/jpeg" : docMime || "image/jpeg";
            await tgTyping(chatId, "upload_photo");
            const f = await downloadTgFile(fileId);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, mainKeyboard);
              return Response.json({ ok: true });
            }
            const out = await removeBackground(f.bytes, mime);
            if (!out) {
              await tgSendMessage(chatId, "❌ លុប background មិនបានសម្រេច", msgId, mainKeyboard);
              return Response.json({ ok: true });
            }
            await tgSendDocumentBytes(chatId, out, "no-bg.png", "✅ លុប background រួច", msgId, mainKeyboard);
            return Response.json({ ok: true });
          }

          // Image → PDF (collect)
          if (session.mode === "img2pdf" && (photo || isImageDoc)) {
            const fileId = photo ? photo.file_id : doc.file_id;
            const f = await downloadTgFile(fileId);
            if (f) {
              session.buffer.push(new Uint8Array(f.bytes));
              await tgSendMessage(
                chatId,
                `📥 បានទទួល ${session.buffer.length} រូប។ ចុច <b>✅ បញ្ចប់</b> ដើម្បីបង្កើត PDF`,
                msgId,
                collectKeyboard,
              );
            }
            return Response.json({ ok: true });
          }

          // Merge PDF (collect)
          if (session.mode === "mergepdf") {
            if (!isPdfDoc) {
              await tgSendMessage(chatId, T.wrongType + " (ត្រូវការ PDF)", msgId, collectKeyboard);
              return Response.json({ ok: true });
            }
            const f = await downloadTgFile(doc.file_id);
            if (f) {
              session.buffer.push(new Uint8Array(f.bytes));
              await tgSendMessage(
                chatId,
                `📥 បានទទួល ${session.buffer.length} PDF។ ចុច <b>✅ បញ្ចប់</b> ដើម្បីបញ្ចូល`,
                msgId,
                collectKeyboard,
              );
            }
            return Response.json({ ok: true });
          }

          // Compress PDF (immediate)
          if (session.mode === "compresspdf") {
            if (!isPdfDoc) {
              await tgSendMessage(chatId, T.wrongType + " (ត្រូវការ PDF)", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            await tgTyping(chatId, "upload_document");
            const f = await downloadTgFile(doc.file_id);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            try {
              const out = await compressPdf(new Uint8Array(f.bytes));
              const before = f.bytes.byteLength;
              const after = out.byteLength;
              const pct = Math.max(0, Math.round((1 - after / before) * 100));
              await tgSendDocumentBytes(
                chatId,
                out,
                "compressed.pdf",
                `✅ បង្រួម PDF (${pct}% តូចជាង)`,
                msgId,
                pdfKeyboard,
              );
            } catch (e) {
              console.error("compress error", e);
              await tgSendMessage(chatId, "❌ បង្រួម PDF មិនបានសម្រេច", msgId, pdfKeyboard);
            }
            return Response.json({ ok: true });
          }

          // ===== Default QR mode =====
          // Photo → scan
          if (photo) {
            await tgTyping(chatId, "typing");
            try {
              const scanned = await scanQrFromTelegramFile(photo.file_id);
              if (!scanned) await tgSendMessage(chatId, T.scanError, msgId, mainKeyboard);
              else await tgSendMessage(chatId, `<code>${escapeHtml(scanned)}</code>`, msgId, mainKeyboard);
            } catch {
              await tgSendMessage(chatId, T.scanFail, msgId, mainKeyboard);
            }
            return Response.json({ ok: true });
          }
          if (isImageDoc) {
            await tgTyping(chatId, "typing");
            try {
              const scanned = await scanQrFromTelegramFile(doc.file_id);
              if (!scanned) await tgSendMessage(chatId, T.scanError, msgId, mainKeyboard);
              else await tgSendMessage(chatId, `<code>${escapeHtml(scanned)}</code>`, msgId, mainKeyboard);
            } catch {
              await tgSendMessage(chatId, T.scanFail, msgId, mainKeyboard);
            }
            return Response.json({ ok: true });
          }

          // Text handling by mode
          if (text) {
            if (session.mode === "shorturl") {
              await tgTyping(chatId, "typing");
              const short = await shortenUrl(text);
              if (!short) {
                await tgSendMessage(chatId, "❌ បង្រួមតំណមិនបានសម្រេច", msgId, mainKeyboard);
              } else {
                await tgSendMessage(chatId, `🔗 <code>${escapeHtml(short)}</code>`, msgId, mainKeyboard);
              }
              return Response.json({ ok: true });
            }
            // Default: QR
            await tgTyping(chatId, "upload_photo");
            const url = buildQrUrl(text);
            const shareMarkup = {
              inline_keyboard: [
                [{ text: "📤 ផ្ញើទៅជជែកផ្សេង", switch_inline_query: text }],
              ],
            };
            await tgSendPhotoUrl(chatId, url, "", msgId, shareMarkup);
          }
        } catch (err) {
          console.error("telegram webhook error", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
