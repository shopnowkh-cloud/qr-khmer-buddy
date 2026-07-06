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

// Returns the reply_markup to attach. If caller passed one, use it as-is.
// Otherwise default to the persistent mainKeyboard so the "ទំព័រដើម" button never disappears.
// Inline keyboards are passed through untouched (they cannot coexist with a reply keyboard).
function ensureKb(reply_markup?: unknown): unknown {
  if (reply_markup) return reply_markup;
  // mainKeyboard is defined later in the module; runtime lookup is safe.
  return mainKeyboard;
}

async function tgSendPhotoUrl(
  chat_id: number,
  photoUrl: string,
  caption?: string,
  reply_to?: number,
  reply_markup?: unknown,
) {
  void reply_to;
  return tg("sendPhoto", {
    chat_id,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
    reply_markup: ensureKb(reply_markup),
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
  void reply_to;
  form.append("reply_markup", JSON.stringify(ensureKb(reply_markup)));
  form.append("photo", new Blob([bytes as unknown as BlobPart]), filename);
  const res = await fetch(`${TG_API()}/sendPhoto`, {
    method: "POST",
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
  void reply_to;
  form.append("reply_markup", JSON.stringify(ensureKb(reply_markup)));
  form.append("document", new Blob([bytes as unknown as BlobPart]), filename);
  const res = await fetch(`${TG_API()}/sendDocument`, {
    method: "POST",
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
  void reply_to;
  form.append("reply_markup", JSON.stringify(ensureKb(reply_markup)));
  void filename;
  form.append("voice", new Blob([bytes as unknown as BlobPart], { type: "audio/ogg" }), "voice.ogg");
  const res = await fetch(`${TG_API()}/sendVoice`, {
    method: "POST",
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
    reply_markup: ensureKb(reply_markup),
    ...(reply_to ? { reply_parameters: { message_id: reply_to, allow_sending_without_reply: true } } : {}),
    ...(message_effect_id ? { message_effect_id } : {}),
  });
}

async function tgTyping(chat_id: number, action: "typing" | "upload_photo" | "upload_document" | "record_voice" | "upload_voice" = "typing") {
  return tg("sendChatAction", { chat_id, action });
}

const FIRE_MESSAGE_EFFECT = "5104841245755180586"; // 🔥 only

// ========== Menu / Keyboards ==========
const BTN = {
  qr: "បង្កើត QR",
  pdf: "PDF Tools",
  shorturl: "🔗 Short URL",
  tts: "បង្កើតសំឡេង Ai",
  help: "ℹ️ ជំនួយ",
  img2pdf: "🖼️→📄 រូបភាព→PDF",
  mergepdf: "➕ បញ្ចូល PDF",
  compresspdf: "📉 បង្រួម PDF",
  lockpdf: "🔒 ដាក់ Password",
  unlockpdf: "🔓 ដកចេញ Password",
  back: "⬅️ ត្រឡប់",
  home: "ទំព័រដើម",
  done: "✅ បញ្ចប់",
  cancel: "❌ បោះបង់",
  ttsBasic: "🎙 ធម្មតា",
  ttsDesign: "🎨 រចនាសំឡេង",
  ttsClone: "👥 ក្លូនសំឡេង",
  ttsUltra: "✨ ក្លូនពេញលេញ",
  fontstyle: "🅵 Font Style",
};


// Bot API 9.4 — custom emoji IDs on buttons (requires bot owner Premium; auto-fallback otherwise)
const EMOJI = {
  pdf: "5838982342122674517", // 📄
  qr: "5440410042773824003", // 🔗
  home: "5836852493610390525", // 🏘
};

const mainKeyboard = {
  keyboard: [
    [{ text: BTN.qr, icon_custom_emoji_id: EMOJI.qr }, { text: BTN.fontstyle }],
    [{ text: BTN.pdf, icon_custom_emoji_id: EMOJI.pdf }, { text: BTN.tts }],
    [{ text: BTN.shorturl }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const pdfKeyboard = {
  keyboard: [
    [{ text: BTN.img2pdf }, { text: BTN.mergepdf }],
    [{ text: BTN.compresspdf }],
    [{ text: BTN.lockpdf }, { text: BTN.unlockpdf }],
    [{ text: BTN.home, icon_custom_emoji_id: EMOJI.home }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const collectKeyboard = {
  keyboard: [
    [{ text: BTN.home, icon_custom_emoji_id: EMOJI.home }],
    [{ text: BTN.done }, { text: BTN.cancel }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};


const ttsKeyboard = {
  keyboard: [
    [{ text: BTN.ttsBasic }, { text: BTN.ttsDesign }],
    [{ text: BTN.ttsClone }, { text: BTN.ttsUltra }],
    [{ text: BTN.home, icon_custom_emoji_id: EMOJI.home }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};



// Sub-mode keyboard: ONLY the home button. This "locks" the user into the
// active feature — they can't switch to another feature until they press
// «🏘 ទំព័រដើម» to return to the main menu.
const homeOnlyKeyboard = {
  keyboard: [[{ text: BTN.home, icon_custom_emoji_id: EMOJI.home }]],
  resize_keyboard: true,
  is_persistent: true,
};

// Alias kept so existing call sites continue to compile; both point at the
// same "home-only" keyboard now.
const homeKeyboard = homeOnlyKeyboard;



// ========== Text ==========
const T = {
  welcome:
    "👋 <b>សួស្តី! សូមស្វាគមន៍មកកាន់ Multi-Tool Bot</b>\n\n" +
    "<b>🤖 មុខងារ៖</b>\n" +
    "📱 QR Code | 🅵 Font Style\n" +
    "📄 PDF Tools | 🔊 TTS សំឡេង\n" +
    "🔗 Short URL\n" +
    "\n" +
    "<i>💡 ជ្រើសរើសមុខងារពី keyboard ខាងក្រោម!</i>",
  qrMode:
    "📱 <b>QR Code Mode</b>\n\n" +
    "• សរសេរអក្សរ ឬតំណ → បង្កើត QR\n" +
    "• ផ្ញើរូបភាព → ស្កេន QR",
  shorturlMode: "🔗 <b>Short URL</b>\n\nផ្ញើតំណ (URL) ដើម្បីបង្រួម",
  pdfMenu: '<tg-emoji emoji-id="5838982342122674517">📄</tg-emoji> <b>PDF Tools</b>\n\nជ្រើសរើសមុខងារ៖',
  img2pdfMode: "🖼️→📄 <b>រូបភាព → PDF</b>\n\nផ្ញើរូបភាពមួយ ឬច្រើន រួចចុច <b>✅ បញ្ចប់</b>",
  mergeMode: "➕ <b>បញ្ចូល PDF</b>\n\nផ្ញើ PDF ចាប់ពី 2 ឯកសារឡើងទៅ រួចចុច <b>✅ បញ្ចប់</b>",
  compressMode: "📉 <b>បង្រួម PDF</b>\n\nផ្ញើឯកសារ PDF មួយ",
  lockPdfMode: "🔒 <b>ដាក់ Password លើ PDF</b>\n\nផ្ញើឯកសារ PDF មុនសិន",
  unlockPdfMode: "🔓 <b>ដក Password ចេញពី PDF</b>\n\nផ្ញើឯកសារ PDF ដែលមាន password",
  askLockPassword: "🔑 សូមផ្ញើពាក្យសម្ងាត់ដែលចង់ប្រើ (យ៉ាងតិច 4 តួ)",
  askUnlockPassword: "🔑 សូមផ្ញើពាក្យសម្ងាត់នៃ PDF នេះ",
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

  fontstyleMode:
    "🅵 <b>Font Style</b>\n\n" +
    "សរសេរអក្សរអង់គ្លេស (A–Z, 0–9) → បង្កើតជា Style ផ្សេងៗ\n" +
    "<i>ចុចលើអក្សរណាមួយដើម្បី Copy</i>",
  scanError: "❌ មិនអាចអាន QR Code ពីរូបនេះទេ",
  scanFail: "❌ មានបញ្ហាក្នុងការស្កេន",
  cancelled: "❌ បានបោះបង់",
  empty: "⚠️ មិនទាន់មានឯកសារ",
  wrongType: "⚠️ ប្រភេទឯកសារមិនត្រឹមត្រូវ",
};

async function generateQrPng(text: string): Promise<Uint8Array> {
  // Worker-compatible: qrcode-generator (pure JS matrix) + UPNG (pure JS PNG encoder).
  // Avoids the "qrcode" npm package which needs Node's Buffer/stream/pngjs.
  const qrGen = (await import("qrcode-generator")).default;
  const UPNG = (await import("upng-js")).default;

  const qr = qrGen(0, "H");
  qr.addData(text, "Byte");
  qr.make();
  const modules: number = qr.getModuleCount();

  const scale = 12;
  const margin = 4;
  const size = (modules + margin * 2) * scale;
  const rgba = new Uint8Array(size * size * 4);
  // Fill white
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = 255; rgba[i + 1] = 255; rgba[i + 2] = 255; rgba[i + 3] = 255;
  }
  // Paint dark modules
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
  return new Uint8Array(png);
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
      { tryHarder: true, tryInvert: true, tryDownscale: true, tryRotate: true, binarizer: "LocalAverage" as const },
      { tryHarder: true, tryInvert: true, tryDownscale: true, tryRotate: true, binarizer: "GlobalHistogram" as const },
      { tryHarder: true, tryInvert: true, tryDownscale: true, tryRotate: true, binarizer: "FixedThreshold" as const },
      { tryHarder: true, tryInvert: true, tryDownscale: false, tryRotate: true, binarizer: "LocalAverage" as const },
    ];
    for (const opts of tryOpts) {
      try {
        const results = await readBarcodesFromImageFile(blob, {
          formats: ["QRCode", "MicroQRCode"],
          ...opts,
        });
        const r = results?.[0];
        if (r?.text) return r.text;
      } catch (inner) {
        console.error("zxing inner error", inner);
      }
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
  const dl = await fetch(`${TG_FILE()}/${fileInfo.result.file_path}`);
  if (!dl.ok) return null;
  return { bytes: await dl.arrayBuffer(), path: fileInfo.result.file_path };
}

async function scanQrFromTelegramFile(fileId: string): Promise<string | null> {
  const f = await downloadTgFile(fileId);
  if (!f) return null;
  const local = await scanWithZxing(f.bytes);
  if (local) return local;
  const remote = await scanWithQrserver(f.bytes);
  if (remote) return remote;
  // Last-resort: re-fetch as PNG via image transform if the file host supports it
  return null;
}

function escapeHtml(s: string) {
  return s.replace(/[<>&]/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
}

// ========== Feature: Fancy Font Styles ==========
// Convert ASCII A-Z, a-z, 0-9 to Unicode "mathematical" / stylistic variants.
function toFancy(text: string, upperBase: number, lowerBase: number, digitBase: number | null): string {
  const out: string[] = [];
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code >= 65 && code <= 90) out.push(String.fromCodePoint(upperBase + (code - 65)));
    else if (code >= 97 && code <= 122) out.push(String.fromCodePoint(lowerBase + (code - 97)));
    else if (digitBase !== null && code >= 48 && code <= 57) out.push(String.fromCodePoint(digitBase + (code - 48)));
    else out.push(ch);
  }
  return out.join("");
}

function toCircled(text: string): string {
  // ⓐ etc. — no digit 0
  const A = 0x24B6, a = 0x24D0;
  return [...text].map((ch) => {
    const c = ch.codePointAt(0)!;
    if (c >= 65 && c <= 90) return String.fromCodePoint(A + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(a + (c - 97));
    if (c >= 49 && c <= 57) return String.fromCodePoint(0x2460 + (c - 49));
    if (c === 48) return "⓪";
    return ch;
  }).join("");
}

function toSquared(text: string): string {
  // 🅰 🅱 style (negative squared)
  return [...text].map((ch) => {
    const c = ch.codePointAt(0)!;
    if (c >= 65 && c <= 90) return String.fromCodePoint(0x1F170 + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(0x1F170 + (c - 97));
    return ch;
  }).join("");
}

function toFullwidth(text: string): string {
  return [...text].map((ch) => {
    const c = ch.codePointAt(0)!;
    if (c >= 33 && c <= 126) return String.fromCodePoint(0xFF00 + (c - 32));
    if (c === 32) return "　";
    return ch;
  }).join("");
}

function toSmallCaps(text: string): string {
  const map: Record<string, string> = {
    a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",
    n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"
  };
  return [...text.toLowerCase()].map((ch) => map[ch] ?? ch).join("");
}

function buildFancyList(input: string): { label: string; value: string }[] {
  // Script fonts have gaps in Unicode (e.g. B, E, F, H, I, L, M, R, e, g, o are separate) — handled by SMP blocks.
  // Using known base codepoints for contiguous blocks; letters with holes fall back to plain char via toFancy default.
  const styles: { label: string; value: string }[] = [];
  // Bold
  styles.push({ label: "𝗕𝗼𝗹𝗱 Sans", value: toFancy(input, 0x1D5D4, 0x1D5EE, 0x1D7EC) });
  // Italic Sans
  styles.push({ label: "𝘐𝘵𝘢𝘭𝘪𝘤 Sans", value: toFancy(input, 0x1D608, 0x1D622, null) });
  // Bold Italic Sans
  styles.push({ label: "𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘", value: toFancy(input, 0x1D63C, 0x1D656, null) });
  // Serif Bold
  styles.push({ label: "𝐒𝐞𝐫𝐢𝐟 𝐁𝐨𝐥𝐝", value: toFancy(input, 0x1D400, 0x1D41A, 0x1D7CE) });
  // Serif Italic
  styles.push({ label: "𝑆𝑒𝑟𝑖𝑓 𝐼𝑡𝑎𝑙𝑖𝑐", value: toFancy(input, 0x1D434, 0x1D44E, null) });
  // Monospace
  styles.push({ label: "𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎", value: toFancy(input, 0x1D670, 0x1D68A, 0x1D7F6) });
  // Double-struck
  styles.push({ label: "𝔻𝕠𝕦𝕓𝕝𝕖", value: toFancy(input, 0x1D538, 0x1D552, 0x1D7D8) });
  // Fraktur
  styles.push({ label: "𝔉𝔯𝔞𝔨𝔱𝔲𝔯", value: toFancy(input, 0x1D504, 0x1D51E, null) });
  // Script (cursive)
  styles.push({ label: "𝒮𝒸𝓇𝒾𝓅𝓉", value: toFancy(input, 0x1D49C, 0x1D4B6, null) });
  // Bold Script
  styles.push({ label: "𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽", value: toFancy(input, 0x1D4D0, 0x1D4EA, null) });
  // Small Caps
  styles.push({ label: "Sᴍᴀʟʟ Cᴀᴘs", value: toSmallCaps(input) });
  // Circled
  styles.push({ label: "Ⓒⓘⓡⓒⓛⓔⓓ", value: toCircled(input) });
  // Squared
  styles.push({ label: "🆂🆀🆄🅰🆁🅴🅳", value: toSquared(input) });
  // Fullwidth
  styles.push({ label: "Ｆｕｌｌｗｉｄｔｈ", value: toFullwidth(input) });
  return styles;
}


// ========== Session State (in-memory, per worker) ==========
type Mode =
  | "idle"
  | "qr"
  | "shorturl"
  | "pdfmenu"
  | "img2pdf"
  | "mergepdf"
  | "compresspdf"
  | "lockpdf"
  | "lockpdf_password"
  | "unlockpdf"
  | "unlockpdf_password"
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
  | "fontstyle";

interface Session {
  mode: Mode;
  buffer: Uint8Array[];
  ttsDesignInstr?: string;
  ttsRefBytes?: Uint8Array;
  ttsRefMime?: string;
  ttsRefTranscript?: string;
  pendingPdf?: Uint8Array;
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

// Lock/Unlock via @cantoo/pdf-lib fork (supports AES encryption).
async function lockPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await import("@cantoo/pdf-lib");
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  src.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false,
    },
  } as never);
  return await src.save();
}

async function unlockPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await import("@cantoo/pdf-lib");
  const src = await PDFDocument.load(bytes, { password } as never);
  return await src.save();
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






// ========== Main handler ==========
export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tgKey = process.env.TELEGRAM_BOT_TOKEN;
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

          // callback_query updates: acknowledge and re-assert the persistent keyboard.
          if (update.callback_query) {
            const cq = update.callback_query;
            await tg("answerCallbackQuery", { callback_query_id: cq.id });
            const cqChatId = cq.message?.chat?.id;
            if (cqChatId) {
              await tgSendMessage(cqChatId, "⬇️", undefined, mainKeyboard);
            }
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
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard, FIRE_MESSAGE_EFFECT);
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
          if (text === BTN.back || text === BTN.home) {
            session.mode = "idle";
            session.buffer = [];
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.cancel) {
            session.buffer = [];
            const wasPdf = ["img2pdf", "mergepdf", "compresspdf", "lockpdf", "lockpdf_password", "unlockpdf", "unlockpdf_password"].includes(session.mode);
            session.pendingPdf = undefined;
            session.mode = wasPdf ? "pdfmenu" : "idle";
            await tgSendMessage(chatId, T.cancelled, msgId, wasPdf ? pdfKeyboard : mainKeyboard);
            return Response.json({ ok: true });
          }

          if (text === BTN.qr) {
            session.mode = "qr";
            session.buffer = [];
            await tgSendMessage(chatId, T.qrMode, msgId, homeOnlyKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.shorturl) {
            session.mode = "shorturl";
            session.buffer = [];
            await tgSendMessage(chatId, T.shorturlMode, msgId, homeKeyboard);
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
            await tgSendMessage(chatId, T.compressMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.lockpdf) {
            session.mode = "lockpdf";
            session.buffer = [];
            session.pendingPdf = undefined;
            await tgSendMessage(chatId, T.lockPdfMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.unlockpdf) {
            session.mode = "unlockpdf";
            session.buffer = [];
            session.pendingPdf = undefined;
            await tgSendMessage(chatId, T.unlockPdfMode, msgId, homeKeyboard);
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
            await tgSendMessage(chatId, T.ttsBasicMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsDesign) {
            session.mode = "tts_design_instr";
            session.ttsDesignInstr = undefined;
            await tgSendMessage(chatId, T.ttsDesignAskInstr, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsClone) {
            session.mode = "tts_clone_audio";
            session.ttsRefBytes = undefined;
            session.ttsRefMime = undefined;
            session.ttsRefTranscript = undefined;
            await tgSendMessage(chatId, T.ttsCloneAskAudio, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.ttsUltra) {
            session.mode = "tts_ultra_audio";
            session.ttsRefBytes = undefined;
            session.ttsRefMime = undefined;
            await tgSendMessage(chatId, T.ttsUltraAskAudio, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.fontstyle) {
            session.mode = "fontstyle";
            session.buffer = [];
            await tgSendMessage(chatId, T.fontstyleMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }


          // Password input for lock/unlock PDF
          if (session.mode === "lockpdf_password" && session.pendingPdf) {
            const password = text.trim();
            if (password.length < 4) {
              await tgSendMessage(chatId, "⚠️ Password ត្រូវមានយ៉ាងតិច 4 តួ", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            await tgTyping(chatId, "upload_document");
            try {
              const out = await lockPdf(session.pendingPdf, password);
              await tgSendDocumentBytes(chatId, out, "locked.pdf", `🔒 ដាក់ Password រួច`, msgId, pdfKeyboard);
            } catch (e) {
              console.error("lockpdf error", e);
              await tgSendMessage(chatId, "❌ ដាក់ Password មិនបានសម្រេច", msgId, pdfKeyboard);
            }
            session.pendingPdf = undefined;
            session.mode = "pdfmenu";
            return Response.json({ ok: true });
          }
          if (session.mode === "unlockpdf_password" && session.pendingPdf) {
            const password = text.trim();
            await tgTyping(chatId, "upload_document");
            try {
              const out = await unlockPdf(session.pendingPdf, password);
              await tgSendDocumentBytes(chatId, out, "unlocked.pdf", `🔓 ដក Password ចេញរួច`, msgId, pdfKeyboard);
              session.pendingPdf = undefined;
              session.mode = "pdfmenu";
            } catch (e) {
              console.error("unlockpdf error", e);
              await tgSendMessage(chatId, "❌ Password មិនត្រឹមត្រូវ ឬ PDF មិនអាចដកបាន។ សូមព្យាយាមម្តងទៀត។", msgId, pdfKeyboard);
            }
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
            await tgSendMessage(chatId, T.qrMode, msgId, homeOnlyKeyboard);
            return Response.json({ ok: true });
          }

          // Idle mode: user must press a keyboard button first
          if (session.mode === "idle") {
            // Force-refresh the reply keyboard: remove any lingering sub-mode
            // keyboard first, then send the warning with the main keyboard.
            await tg("sendMessage", {
              chat_id: chatId,
              text: "⚠️ សូមចុចប៊ូតុងខាងក្រោមដើម្បីជ្រើសរើសមុខងារមុននឹងប្រើ។",
              parse_mode: "HTML",
              reply_markup: mainKeyboard,
            });

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

          // Lock PDF — receive PDF, then ask password
          if (session.mode === "lockpdf") {
            if (!isPdfDoc) {
              await tgSendMessage(chatId, T.wrongType + " (ត្រូវការ PDF)", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            const f = await downloadTgFile(doc.file_id);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            session.pendingPdf = new Uint8Array(f.bytes);
            session.mode = "lockpdf_password";
            await tgSendMessage(chatId, T.askLockPassword, msgId, pdfKeyboard);
            return Response.json({ ok: true });
          }

          // Unlock PDF — receive PDF, then ask password
          if (session.mode === "unlockpdf") {
            if (!isPdfDoc) {
              await tgSendMessage(chatId, T.wrongType + " (ត្រូវការ PDF)", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            const f = await downloadTgFile(doc.file_id);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            session.pendingPdf = new Uint8Array(f.bytes);
            session.mode = "unlockpdf_password";
            await tgSendMessage(chatId, T.askUnlockPassword, msgId, pdfKeyboard);
            return Response.json({ ok: true });
          }



          // ===== QR scan: accept photo, sticker, or any document =====
          if (session.mode === "qr") {
            const sticker = msg.sticker as { file_id: string; is_animated?: boolean; is_video?: boolean } | undefined;
            const qrFileId =
              photo?.file_id ||
              (sticker && !sticker.is_animated && !sticker.is_video ? sticker.file_id : null) ||
              (doc ? doc.file_id : null);
            if (qrFileId) {
              await tgTyping(chatId, "typing");
              try {
                const scanned = await scanQrFromTelegramFile(qrFileId);
                if (!scanned) await tgSendMessage(chatId, T.scanError, msgId, homeOnlyKeyboard);
                else await tg("sendMessage", { chat_id: chatId, text: scanned, reply_markup: homeOnlyKeyboard });
              } catch (e) {
                console.error("qr scan error", e);
                await tgSendMessage(chatId, T.scanFail, msgId, homeOnlyKeyboard);
              }
              return Response.json({ ok: true });
            }
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
              await tgTyping(chatId, "record_voice");
              const ogg = await synthesizeSpeech(text);
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.wav", undefined, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_design_instr") {
              session.ttsDesignInstr = text.slice(0, 300);
              session.mode = "tts_design_text";
              await tgSendMessage(chatId, T.ttsDesignAskText, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_design_text") {
              await tgTyping(chatId, "record_voice");
              const ogg = await synthesizeSpeech(text, { controlInstruction: session.ttsDesignInstr });
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.wav", undefined, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_clone_transcript") {
              session.ttsRefTranscript = text.slice(0, 500);
              session.mode = "tts_clone_text";
              await tgSendMessage(chatId, T.ttsCloneAskText, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_clone_text") {
              await tgTyping(chatId, "record_voice");
              const ogg = await synthesizeSpeech(text, {
                refBytes: session.ttsRefBytes,
                refMime: session.ttsRefMime,
                refTranscript: session.ttsRefTranscript,
              });
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.wav", undefined, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_ultra_text") {
              await tgTyping(chatId, "record_voice");
              const ogg = await synthesizeSpeech(text, {
                refBytes: session.ttsRefBytes,
                refMime: session.ttsRefMime,
              });
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.wav", undefined, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }

            if (session.mode === "tts_menu" || session.mode === "tts_clone_audio" || session.mode === "tts_ultra_audio") {
              await tgSendMessage(chatId, "⚠️ សូមផ្ញើសំឡេងគំរូជាមុន (voice message ឬឯកសារ audio)", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "fontstyle") {
              const input = text.trim();
              if (!input) {
                await tgSendMessage(chatId, "⚠️ សូមសរសេរអក្សរអង់គ្លេស", msgId, homeKeyboard);
                return Response.json({ ok: true });
              }
              const styles = buildFancyList(input);
              const rows = styles.map((s) => [{ text: s.value, copy_text: { text: s.value } }]);
              await tgSendMessage(chatId, `🅵 <b>Font Styles</b>\n<i>ចុចប៊ូតុងខាងក្រោមដើម្បី Copy</i>`, msgId, { inline_keyboard: rows });
              return Response.json({ ok: true });
            }



            // Default: QR (only when user selected QR mode)
            if (session.mode === "qr") {
              await tgTyping(chatId, "upload_photo");
              try {
                const png = await generateQrPng(text);
                await tgSendPhotoBytes(chatId, png, "qr.png", "", msgId, homeOnlyKeyboard);
              } catch (e) {
                console.error("qr generate error", e);
                await tgSendMessage(chatId, "❌ បង្កើត QR មិនបានសម្រេច", msgId, homeOnlyKeyboard);
              }
            }
          }
        } catch (err) {
          console.error("telegram webhook error", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
