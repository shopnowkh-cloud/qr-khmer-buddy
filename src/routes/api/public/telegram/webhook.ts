import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";


const TG_API = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const TG_FILE = () => `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}`;

function deriveWebhookSecret(key: string) {
  return createHash("sha256").update(`telegram-webhook:${key}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

async function tg(method: string, body: unknown) {
  const res = await fetch(`${TG_API()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  pdf: "PDF",
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
  ttsBasic: "🎙 ធម្មតា",
  ttsDesign: "🎨 រចនាសំឡេង",
  ttsClone: "👥 ក្លូនសំឡេង",
  ttsUltra: "✨ ក្លូនពេញលេញ",
};

// Bot API 9.4 — custom emoji IDs on buttons (requires bot owner Premium; auto-fallback otherwise)
const EMOJI = {
  pdf: "5838982342122674517", // 📄
};

const mainKeyboard = {
  keyboard: [
    [{ text: BTN.qr }, { text: BTN.removebg }],
    [{ text: BTN.pdf, icon_custom_emoji_id: EMOJI.pdf }],
    [{ text: BTN.tts }, { text: BTN.ocr }],
    [{ text: BTN.translate }, { text: BTN.currency }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const pdfKeyboard = {
  keyboard: [
    [{ text: BTN.img2pdf }, { text: BTN.pdf2img }],
    [{ text: BTN.mergepdf }, { text: BTN.compresspdf }],
    [{ text: BTN.pdftext, icon_custom_emoji_id: EMOJI.pdf }],
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

const ttsKeyboard = {
  keyboard: [
    [{ text: BTN.ttsBasic }, { text: BTN.ttsDesign }],
    [{ text: BTN.ttsClone }, { text: BTN.ttsUltra }],
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
    "📄 PDF | 🎨 Image Format\n" +
    "🔊 TTS សំឡេង | 🔍 OCR អានអក្សរ\n" +
    "🌐 បកប្រែ | 💱 USD⇄KHR | 🔗 Short URL\n\n" +
    "<i>💡 ជ្រើសរើសមុខងារពី keyboard ខាងក្រោម!</i>",
  qrMode:
    "📱 <b>QR Code Mode</b>\n\n" +
    "• សរសេរអក្សរ ឬតំណ → បង្កើត QR\n" +
    "• ផ្ញើរូបភាព → ស្កេន QR",
  removebgMode: "🖼️ <b>Remove Background</b>\n\nផ្ញើរូបភាព ដើម្បីលុប background",
  shorturlMode: "🔗 <b>Short URL</b>\n\nផ្ញើតំណ (URL) ដើម្បីបង្រួម",
  pdfMenu: '<tg-emoji emoji-id="5838982342122674517">📄</tg-emoji> <b>PDF Tools</b>\n\nជ្រើសរើសមុខងារ៖',
  img2pdfMode: "🖼️→📄 <b>រូបភាព → PDF</b>\n\nផ្ញើរូបភាពមួយ ឬច្រើន រួចចុច <b>✅ បញ្ចប់</b>",
  mergeMode: "➕ <b>បញ្ចូល PDF</b>\n\nផ្ញើ PDF ចាប់ពី 2 ឯកសារឡើងទៅ រួចចុច <b>✅ បញ្ចប់</b>",
  compressMode: "📉 <b>បង្រួម PDF</b>\n\nផ្ញើឯកសារ PDF មួយ",
  pdf2imgMode: "📄→🖼️ <b>PDF → រូបភាព</b>\n\nផ្ញើឯកសារ PDF",
  pdfTextMode: "📝 <b>អានអក្សរពី PDF</b>\n\nផ្ញើឯកសារ PDF",
  ttsMode:
    "🔊 <b>VoxCPM2 — Text to Speech</b>\n\n" +
    "ជ្រើសរើសរបៀប៖\n" +
    "🎙 <b>ធម្មតា</b> — សំឡេងស្តង់ដារ\n" +
    "🎨 <b>រចនាសំឡេង</b> — ណែនាំសំឡេង (ឧ. speak slowly and warmly)\n" +
    "👥 <b>ក្លូនសំឡេង</b> — ផ្ញើសំឡេងគំរូ + អក្សរបកស្រាយ\n" +
    "✨ <b>ក្លូនពេញលេញ</b> — ផ្ញើសំឡេងគំរូតែម្នាក់ឯង",
  ttsBasicMode: "🎙 <b>ធម្មតា</b>\n\nសរសេរអក្សរដើម្បីបម្លែងជាសំឡេង",
  ttsDesignAskInstr:
    "🎨 <b>រចនាសំឡេង — ជំហាន 1/2</b>\n\n" +
    "សរសេរការណែនាំសំឡេង (English ល្អបំផុត)។\n" +
    "ឧទាហរណ៍៖\n" +
    "• <code>speak slowly and warmly</code>\n" +
    "• <code>angry male voice</code>\n" +
    "• <code>excited young female</code>",
  ttsDesignAskText: "🎨 <b>ជំហាន 2/2</b>\n\nសរសេរអក្សរដើម្បីបម្លែងជាសំឡេង",
  ttsCloneAskAudio:
    "👥 <b>ក្លូនសំឡេង — ជំហាន 1/3</b>\n\n" +
    "ផ្ញើ voice message ឬឯកសារសំឡេង (MP3/WAV/OGG) 5–15 វិនាទី ជាគំរូ",
  ttsCloneAskTranscript:
    "👥 <b>ជំហាន 2/3</b>\n\nសរសេរអក្សរដែលនៅក្នុងសំឡេងគំរូនោះ (transcript ត្រឹមត្រូវ)",
  ttsCloneAskText: "👥 <b>ជំហាន 3/3</b>\n\nសរសេរអក្សរដែលអ្នកចង់ឲ្យសំឡេងនិយាយ",
  ttsUltraAskAudio:
    "✨ <b>ក្លូនពេញលេញ — ជំហាន 1/2</b>\n\n" +
    "ផ្ញើ voice message ឬឯកសារសំឡេង (5–15 វិនាទី) ជាគំរូ",
  ttsUltraAskText: "✨ <b>ជំហាន 2/2</b>\n\nសរសេរអក្សរដែលអ្នកចង់ឲ្យសំឡេងនិយាយ",
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
  | "idle"
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
  | "tts_menu"
  | "tts_basic"
  | "tts_design_instr"
  | "tts_design_text"
  | "tts_clone_audio"
  | "tts_clone_transcript"
  | "tts_clone_text"
  | "tts_ultra_audio"
  | "tts_ultra_text"
  | "ocr"
  | "translate"
  | "currency"
  | "imgconv"
  | "imgconv_pick";

interface Session {
  mode: Mode;
  buffer: Uint8Array[];
  lastImage?: { bytes: Uint8Array; mime: string };
  ttsDesignInstr?: string;
  ttsRefBytes?: Uint8Array;
  ttsRefMime?: string;
  ttsRefTranscript?: string;
}
const sessions = new Map<number, Session>();

function getSession(chatId: number): Session {
  let s = sessions.get(chatId);
  if (!s) {
    s = { mode: "idle", buffer: [] };
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

// ========== Feature: Remove BG ==========
// Two paths:
// 1. Graphic images (QR codes, logos, documents on white): decode locally and
//    key out the white background pixel-exactly — no AI, so the QR stays scannable.
// 2. Photos: ask Gemini to place the subject on a pure magenta (#FF00FF) matte,
//    then chroma-key that matte out to real alpha.
const KEY_R = 255, KEY_G = 0, KEY_B = 255;

async function decodeToRgba(
  bytes: ArrayBuffer,
  mime: string
): Promise<{ rgba: Uint8Array; w: number; h: number } | null> {
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

// Heuristic: QR / logo / document = mostly near-white + near-black/low-saturation,
// with a large white area touching the borders.
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

// Make near-white pixels transparent (with feather); keeps dark QR modules intact.
async function whiteToTransparent(
  rgba: Uint8Array,
  w: number,
  h: number
): Promise<Uint8Array | null> {
  try {
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
    const out = new Uint8Array(rgba); // copy
    const INNER = 232; // min channel >= this => fully transparent
    const OUTER = 200; // min channel <= this => fully opaque
    for (let i = 0; i < out.length; i += 4) {
      const min = Math.min(out[i], out[i + 1], out[i + 2]);
      if (min >= INNER) {
        out[i + 3] = 0;
      } else if (min > OUTER) {
        const t = (INNER - min) / (INNER - OUTER); // 0..1 toward opaque
        out[i + 3] = Math.round(255 * t);
      }
    }
    return new Uint8Array(UPNG.encode([out.buffer], w, h, 0));
  } catch (e) {
    console.error("whiteToTransparent error", e);
    return null;
  }
}

async function removeBackground(bytes: ArrayBuffer, mime: string): Promise<Uint8Array | null> {
  try {
    // Path 1: local, lossless removal for QR codes / graphics on white
    const decoded = await decodeToRgba(bytes, mime);
    if (decoded && isGraphicOnWhite(decoded.rgba)) {
      const local = await whiteToTransparent(decoded.rgba, decoded.w, decoded.h);
      if (local) return local;
    }

    // Path 2: AI matte for photos
    const b64 = Buffer.from(bytes).toString("base64");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Return the SAME image at the SAME resolution as a PNG with a fully TRANSPARENT background: keep the main subject exactly as-is (identical colors, details, and anti-aliased edges), and replace every non-subject pixel with a single flat pure magenta rgb(255,0,255) — #FF00FF. No gradient, texture, checkerboard, shadow, or watermark. Every non-subject pixel must be exactly rgb(255,0,255) OR fully transparent alpha=0.",
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
    const raw = Buffer.from(base, "base64");
    // Try: if model already returned real transparency, keep it; else chroma-key magenta.
    const passthrough = await keepIfAlreadyTransparent(raw);
    if (passthrough) return passthrough;
    return await chromaKeyToTransparent(raw);
  } catch (e) {
    console.error("removebg error", e);
    return null;
  }
}

// If the model already produced a PNG with real transparency (>2% alpha=0), keep it.
async function keepIfAlreadyTransparent(pngBytes: Buffer): Promise<Uint8Array | null> {
  try {
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
    const img = UPNG.decode(pngBytes);
    const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
    let transparent = 0;
    const total = rgba.length / 4;
    for (let i = 3; i < rgba.length; i += 4) if (rgba[i] < 10) transparent++;
    if (total > 0 && transparent / total >= 0.02) {
      return new Uint8Array(UPNG.encode([rgba.buffer], img.width, img.height, 0));
    }
    return null;
  } catch {
    return null;
  }
}


async function chromaKeyToTransparent(pngBytes: Buffer): Promise<Uint8Array | null> {
  try {
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;

    const img = UPNG.decode(pngBytes);
    const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);
    const w = img.width, h = img.height;

    // Chroma-key: distance from magenta in RGB space.
    // inner threshold -> fully transparent, outer -> feather edge to opaque.
    const INNER = 60;   // <= this distance = background
    const OUTER = 110;  // >= this distance = subject
    let cleared = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const dr = r - KEY_R, dg = g - KEY_G, db = b - KEY_B;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist <= INNER) {
        rgba[i + 3] = 0;
        cleared++;
      } else if (dist < OUTER) {
        const t = (dist - INNER) / (OUTER - INNER); // 0..1
        rgba[i + 3] = Math.round(255 * t);
        // De-spill: subtract magenta cast on semi-transparent edges
        const spill = 1 - t;
        rgba[i]     = Math.max(0, Math.min(255, r - Math.round(spill * 40)));
        rgba[i + 2] = Math.max(0, Math.min(255, b - Math.round(spill * 40)));
      }
    }
    // Verify the matte actually existed: if <2% of pixels became transparent,
    // the AI returned the image WITHOUT a magenta background — treat as failure
    // so the caller's fallbacks run instead of returning the image with bg intact.
    const total = rgba.length / 4;
    if (total === 0 || cleared / total < 0.02) {
      console.error("chroma-key: no magenta matte detected", cleared, "/", total);
      return null;
    }
    const out = UPNG.encode([rgba.buffer], w, h, 0);
    return new Uint8Array(out);
  } catch (e) {
    console.error("chroma-key error", e);
    return null;
  }
}

// Fallback 1: aggressively key out any light background, regardless of heuristic.
async function forceWhiteToTransparent(
  bytes: ArrayBuffer,
  mime: string,
): Promise<Uint8Array | null> {
  const decoded = await decodeToRgba(bytes, mime);
  if (!decoded) return null;
  return await whiteToTransparent(decoded.rgba, decoded.w, decoded.h);
}

// Fallback 2: re-encode original as PNG (keeps alpha if source had it; otherwise
// user still gets a lossless PNG copy of their image instead of an error).
async function reencodeAsPng(bytes: ArrayBuffer, mime: string): Promise<Uint8Array | null> {
  try {
    const decoded = await decodeToRgba(bytes, mime);
    if (!decoded) return null;
    const UPNG = ((await import("upng-js")) as unknown as { default: any }).default;
    return new Uint8Array(UPNG.encode([decoded.rgba.buffer], decoded.w, decoded.h, 0));
  } catch (e) {
    console.error("reencodeAsPng error", e);
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

// ========== Feature: TTS via VoxCPM2 (HuggingFace Space) ==========
// Calls openbmb/VoxCPM-Demo Gradio API directly. Free public Space — no key.
// Rate-limited by HF; may take 10-60s and can 503 when Space is sleeping.
const VOXCPM_SPACE = "https://openbmb-voxcpm-demo.hf.space";

interface VoxOpts {
  controlInstruction?: string;
  refBytes?: Uint8Array;
  refMime?: string;
  refTranscript?: string;
}

async function voxcpmUploadRef(bytes: Uint8Array, mime: string): Promise<string | null> {
  const ext = mime.includes("wav") ? "wav" : mime.includes("mpeg") || mime.includes("mp3") ? "mp3" : "ogg";
  const form = new FormData();
  form.append("files", new Blob([bytes as unknown as BlobPart], { type: mime }), `ref.${ext}`);
  const up = await fetch(`${VOXCPM_SPACE}/gradio_api/upload`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(45000),
  });
  if (!up.ok) return null;
  const arr = (await up.json()) as string[];
  return Array.isArray(arr) && arr[0] ? arr[0] : null;
}

async function voxcpmGenerateOnce(textInput: string, opts: VoxOpts, uploadedPath: string | null): Promise<string> {
  const usePromptText = !!(uploadedPath && opts.refTranscript);
  const payload = {
    data: [
      textInput,
      usePromptText ? "" : (opts.controlInstruction ?? ""),
      uploadedPath
        ? { path: uploadedPath, meta: { _type: "gradio.FileData" }, orig_name: "reference.ogg" }
        : null,
      usePromptText,
      usePromptText ? opts.refTranscript ?? "" : "",
      2.0,
      false,
      false,
    ],
  };
  const initResp = await fetch(`${VOXCPM_SPACE}/gradio_api/call/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  if (!initResp.ok) throw new Error(`VoxCPM init failed: ${initResp.status}`);
  const { event_id } = (await initResp.json()) as { event_id?: string };
  if (!event_id) throw new Error("No event_id from VoxCPM");

  const sseResp = await fetch(`${VOXCPM_SPACE}/gradio_api/call/generate/${event_id}`, {
    signal: AbortSignal.timeout(150000),
  });
  if (!sseResp.ok) throw new Error(`VoxCPM SSE failed: ${sseResp.status}`);

  const text = await sseResp.text();
  let eventType: string | null = null;
  let dataStr: string | null = null;
  for (const line of text.split("\n")) {
    if (line.startsWith("event: ")) eventType = line.slice(7).trim();
    else if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
    else if (line === "") {
      if (eventType === "complete" && dataStr) {
        const parsed = JSON.parse(dataStr);
        const url = parsed?.[0]?.url;
        if (url) return url as string;
      } else if (eventType === "error") {
        throw new Error(`VoxCPM error: ${dataStr ?? "space error"}`);
      }
      eventType = null;
      dataStr = null;
    }
  }
  throw new Error("No audio URL from VoxCPM");
}

async function synthesizeSpeech(text: string, opts: VoxOpts = {}): Promise<Uint8Array | null> {
  const input = text.slice(0, 1000);
  let uploadedPath: string | null = null;
  if (opts.refBytes && opts.refMime) {
    try {
      uploadedPath = await voxcpmUploadRef(opts.refBytes, opts.refMime);
    } catch (e) {
      console.error("voxcpm upload failed", e);
    }
  }
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (attempt > 1) {
        try {
          await fetch(`${VOXCPM_SPACE}/`, { signal: AbortSignal.timeout(10000) });
        } catch {}
        await new Promise((r) => setTimeout(r, 3000));
      }
      const audioUrl = await voxcpmGenerateOnce(input, opts, uploadedPath);
      const audioResp = await fetch(audioUrl, { signal: AbortSignal.timeout(60000) });
      if (!audioResp.ok) throw new Error(`Audio fetch failed: ${audioResp.status}`);
      return new Uint8Array(await audioResp.arrayBuffer());
    } catch (e) {
      lastErr = e;
      console.error(`voxcpm attempt ${attempt} failed`, e);
    }
  }
  console.error("voxcpm all attempts failed", lastErr);
  return null;
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
            session.mode = "idle";
            session.buffer = [];
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard, pickRandom(MESSAGE_EFFECTS));
            return Response.json({ ok: true });
          }

          // Unknown /command → reset to main menu
          if (text.startsWith("/")) {
            session.mode = "idle";
            session.buffer = [];
            await tgSendMessage(chatId, "⚠️ ពាក្យបញ្ជាមិនត្រឹមត្រូវ។ ត្រឡប់ទៅម៉ឺនុយដើម។", msgId, mainKeyboard);
            return Response.json({ ok: true });
          }

          if (text === BTN.help) {
            session.mode = "idle";
            session.buffer = [];
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.back) {
            session.mode = "idle";
            session.buffer = [];
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.cancel) {
            session.buffer = [];
            const wasPdf = ["img2pdf", "pdf2img", "mergepdf", "compresspdf", "pdftext"].includes(session.mode);
            session.mode = wasPdf ? "pdfmenu" : "idle";
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
          if (text === BTN.pdftext) {
            session.mode = "pdftext";
            session.buffer = [];
            await tgSendMessage(chatId, T.pdfTextMode, msgId, pdfKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.tts) {
            session.mode = "tts_menu";
            session.buffer = [];
            session.ttsDesignInstr = undefined;
            session.ttsRefBytes = undefined;
            session.ttsRefMime = undefined;
            session.ttsRefTranscript = undefined;
            await tgSendMessage(chatId, T.ttsMode, msgId, ttsKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsBasic) {
            session.mode = "tts_basic";
            await tgSendMessage(chatId, T.ttsBasicMode, msgId, ttsKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsDesign) {
            session.mode = "tts_design_instr";
            session.ttsDesignInstr = undefined;
            await tgSendMessage(chatId, T.ttsDesignAskInstr, msgId, ttsKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsClone) {
            session.mode = "tts_clone_audio";
            session.ttsRefBytes = undefined;
            session.ttsRefMime = undefined;
            session.ttsRefTranscript = undefined;
            await tgSendMessage(chatId, T.ttsCloneAskAudio, msgId, ttsKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsUltra) {
            session.mode = "tts_ultra_audio";
            session.ttsRefBytes = undefined;
            session.ttsRefMime = undefined;
            await tgSendMessage(chatId, T.ttsUltraAskAudio, msgId, ttsKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ocr) {
            session.mode = "ocr";
            session.buffer = [];
            await tgSendMessage(chatId, T.ocrMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.translate) {
            session.mode = "translate";
            session.buffer = [];
            await tgSendMessage(chatId, T.translateMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.currency) {
            session.mode = "currency";
            session.buffer = [];
            await tgSendMessage(chatId, T.currencyMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.imgconv) {
            session.mode = "imgconv";
            session.buffer = [];
            session.lastImage = undefined;
            await tgSendMessage(chatId, T.imgconvMode, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if ([BTN.fmtPng, BTN.fmtJpg, BTN.fmtWebp].includes(text) && session.mode === "imgconv_pick" && session.lastImage) {
            const target = text === BTN.fmtPng ? "png" : text === BTN.fmtJpg ? "jpg" : "webp";
            await tgTyping(chatId, "upload_photo");
            const li = session.lastImage;
            const ab = new ArrayBuffer(li.bytes.byteLength);
            new Uint8Array(ab).set(li.bytes);
            const out = await convertImageFormat(ab, li.mime, target);

            if (!out) {
              await tgSendMessage(chatId, "❌ ប្តូរ format មិនបានសម្រេច", msgId, mainKeyboard);
            } else {
              await tgSendDocumentBytes(chatId, out, `converted.${target}`, `✅ ប្តូរទៅ ${target.toUpperCase()}`, msgId, mainKeyboard);
            }
            session.mode = "imgconv";
            session.lastImage = undefined;
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

          // Idle mode: user must press a keyboard button first
          if (session.mode === "idle") {
            await tgSendMessage(
              chatId,
              "⚠️ សូមចុចប៊ូតុងខាងក្រោមដើម្បីជ្រើសរើសមុខងារមុននឹងប្រើ។",
              msgId,
              mainKeyboard,
            );
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

          // TTS cloning: receive reference audio (voice / audio / audio-document)
          const voice = msg.voice as { file_id: string; mime_type?: string } | undefined;
          const audio = msg.audio as { file_id: string; mime_type?: string } | undefined;
          const isAudioDoc =
            !!doc &&
            (/^audio\//.test(docMime) || /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(docName));
          const audioMsg = voice ?? audio ?? (isAudioDoc ? { file_id: doc.file_id, mime_type: docMime } : null);
          if (
            audioMsg &&
            (session.mode === "tts_clone_audio" || session.mode === "tts_ultra_audio")
          ) {
            const f = await downloadTgFile(audioMsg.file_id);
            if (!f) {
              await tgSendMessage(chatId, "❌ ទាញយកសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            session.ttsRefBytes = new Uint8Array(f.bytes);
            session.ttsRefMime = audioMsg.mime_type || (voice ? "audio/ogg" : "audio/mpeg");
            if (session.mode === "tts_clone_audio") {
              session.mode = "tts_clone_transcript";
              await tgSendMessage(chatId, T.ttsCloneAskTranscript, msgId, ttsKeyboard);
            } else {
              session.mode = "tts_ultra_text";
              await tgSendMessage(chatId, T.ttsUltraAskText, msgId, ttsKeyboard);
            }
            return Response.json({ ok: true });
          }


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
            // Primary: AI + smart local removal
            let out = await removeBackground(f.bytes, mime);
            let caption = "✅ លុប background រួច";
            // Fallback 1: force local white-to-transparent (works for any image on light bg)
            if (!out) {
              out = await forceWhiteToTransparent(f.bytes, mime);
              if (out) caption = "⚠️ AI បរាជ័យ — បានប្រើវិធីលុបផ្ទៃសលោកាល";
            }
            // Fallback 2: return original re-encoded as PNG with alpha channel preserved
            if (!out) {
              out = await reencodeAsPng(f.bytes, mime);
              if (out) caption = "⚠️ លុប background មិនបានសម្រេច — បានរក្សាទុករូបដើមជា PNG";
            }
            if (!out) {
              await tgSendMessage(chatId, "❌ លុប background មិនបានសម្រេច", msgId, mainKeyboard);
              return Response.json({ ok: true });
            }
            await tgSendDocumentBytes(chatId, out, "no-bg.png", caption, msgId, mainKeyboard);
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

          // PDF text extraction
          if (session.mode === "pdftext") {
            if (!isPdfDoc) {
              await tgSendMessage(chatId, T.wrongType + " (ត្រូវការ PDF)", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            await tgTyping(chatId, "typing");
            const f = await downloadTgFile(doc.file_id);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            const extracted = await extractPdfText(new Uint8Array(f.bytes));
            if (!extracted) {
              await tgSendMessage(chatId, "❌ អានអក្សរមិនបានសម្រេច", msgId, pdfKeyboard);
            } else if (extracted.length < 3500) {
              await tgSendMessage(chatId, `📝\n<code>${escapeHtml(extracted)}</code>`, msgId, pdfKeyboard);
            } else {
              const bytes = new TextEncoder().encode(extracted);
              await tgSendDocumentBytes(chatId, bytes, "extracted.txt", "📝 អានអក្សរពី PDF", msgId, pdfKeyboard);
            }
            return Response.json({ ok: true });
          }

          // OCR
          if (session.mode === "ocr" && (photo || isImageDoc)) {
            const fileId = photo ? photo.file_id : doc.file_id;
            const mime = photo ? "image/jpeg" : docMime || "image/jpeg";
            await tgTyping(chatId, "typing");
            const f = await downloadTgFile(fileId);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, mainKeyboard);
              return Response.json({ ok: true });
            }
            const b64 = Buffer.from(f.bytes).toString("base64");
            const out = await geminiText(
              "Extract ALL text visible in this image. Preserve original language (Khmer or English) and line breaks. Return only the raw text, no commentary.",
              { image: { b64, mime } },
            );
            if (!out) {
              await tgSendMessage(chatId, "❌ OCR មិនបានសម្រេច", msgId, mainKeyboard);
            } else {
              await tgSendMessage(chatId, `🔍\n<code>${escapeHtml(out.slice(0, 3800))}</code>`, msgId, mainKeyboard);
            }
            return Response.json({ ok: true });
          }

          // Image format conversion: receive image → ask target
          if (session.mode === "imgconv" && (photo || isImageDoc)) {
            const fileId = photo ? photo.file_id : doc.file_id;
            const mime = photo ? "image/jpeg" : docMime || "image/jpeg";
            const f = await downloadTgFile(fileId);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, mainKeyboard);
              return Response.json({ ok: true });
            }
            session.lastImage = { bytes: new Uint8Array(f.bytes), mime };
            session.mode = "imgconv_pick";
            await tgSendMessage(chatId, "🎨 ជ្រើសរើស format គោលដៅ៖", msgId, imgFmtKeyboard);
            return Response.json({ ok: true });
          }

          // ===== Default QR mode =====
          // Photo → scan

          if (photo) {
            await tgTyping(chatId, "typing");
            try {
              const scanned = await scanQrFromTelegramFile(photo.file_id);
              if (!scanned) await tgSendMessage(chatId, T.scanError, msgId, mainKeyboard);
              else await tg("sendMessage", { chat_id: chatId, text: scanned, reply_parameters: { message_id: msgId, allow_sending_without_reply: true }, reply_markup: mainKeyboard });
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
              else await tg("sendMessage", { chat_id: chatId, text: scanned, reply_parameters: { message_id: msgId, allow_sending_without_reply: true }, reply_markup: mainKeyboard });
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
            if (session.mode === "tts_basic") {
              await tgTyping(chatId, "upload_document");
              const mp3 = await synthesizeSpeech(text);
              if (!mp3) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, mp3, "speech.mp3", "🎙 ធម្មតា", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_design_instr") {
              session.ttsDesignInstr = text.slice(0, 300);
              session.mode = "tts_design_text";
              await tgSendMessage(chatId, T.ttsDesignAskText, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_design_text") {
              await tgTyping(chatId, "upload_document");
              const mp3 = await synthesizeSpeech(text, { controlInstruction: session.ttsDesignInstr });
              if (!mp3) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, mp3, "speech.mp3", "🎨 រចនាសំឡេង", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_clone_transcript") {
              session.ttsRefTranscript = text.slice(0, 500);
              session.mode = "tts_clone_text";
              await tgSendMessage(chatId, T.ttsCloneAskText, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_clone_text") {
              await tgTyping(chatId, "upload_document");
              const mp3 = await synthesizeSpeech(text, {
                refBytes: session.ttsRefBytes,
                refMime: session.ttsRefMime,
                refTranscript: session.ttsRefTranscript,
              });
              if (!mp3) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, mp3, "speech.mp3", "👥 ក្លូនសំឡេង", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_ultra_text") {
              await tgTyping(chatId, "upload_document");
              const mp3 = await synthesizeSpeech(text, {
                refBytes: session.ttsRefBytes,
                refMime: session.ttsRefMime,
              });
              if (!mp3) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, mp3, "speech.mp3", "✨ ក្លូនពេញលេញ", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_menu" || session.mode === "tts_clone_audio" || session.mode === "tts_ultra_audio") {
              await tgSendMessage(chatId, "⚠️ សូមផ្ញើសំឡេងគំរូជាមុន (voice message ឬឯកសារ audio)", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "translate") {
              await tgTyping(chatId, "typing");
              const isKhmer = /[\u1780-\u17FF]/.test(text);
              const prompt = isKhmer
                ? `Translate this Khmer text to natural English. Return ONLY the translation, no notes:\n\n${text}`
                : `Translate this text to natural Khmer. Return ONLY the Khmer translation, no notes:\n\n${text}`;
              const out = await geminiText(prompt);
              if (!out) {
                await tgSendMessage(chatId, "❌ បកប្រែមិនបានសម្រេច", msgId, mainKeyboard);
              } else {
                await tgSendMessage(chatId, `🌐 ${escapeHtml(out)}`, msgId, mainKeyboard);
              }
              return Response.json({ ok: true });
            }
            if (session.mode === "currency") {
              await tgTyping(chatId, "typing");
              const out = await convertCurrency(text);
              if (!out) {
                await tgSendMessage(chatId, "⚠️ ទម្រង់មិនត្រឹមត្រូវ។ ឧទាហរណ៍៖ <code>10 usd</code>", msgId, mainKeyboard);
              } else {
                await tgSendMessage(chatId, out, msgId, mainKeyboard);
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
