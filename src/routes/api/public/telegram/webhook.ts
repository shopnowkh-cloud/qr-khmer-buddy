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
    ...(reply_markup ? {} : {}),
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
  void reply_to;
  if (reply_markup) form.append("reply_markup", JSON.stringify(reply_markup));
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
  if (reply_markup) form.append("reply_markup", JSON.stringify(reply_markup));
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
  if (reply_markup) form.append("reply_markup", JSON.stringify(reply_markup));
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
    ...(reply_to ? {} : {}),
    ...(reply_markup ? { reply_markup } : {}),
    ...(message_effect_id ? { message_effect_id } : {}),
  });
}

async function tgTyping(chat_id: number, action: "typing" | "upload_photo" | "upload_document" | "record_voice" | "upload_voice" = "typing") {
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
  qr: "បង្កើត QR",
  removebg: "🖼️ Remove BG",
  pdf: "PDF Tools",
  shorturl: "🔗 Short URL",
  tts: "បង្កើតសំឡេង Ai",
  ocr: "Copy អក្សរ",
  translate: "🌐 បកប្រែ",
  imgconv: "🎨 ប្តូរ Format",
  help: "ℹ️ ជំនួយ",
  img2pdf: "🖼️→📄 រូបភាព→PDF",
  pdf2img: "📄→🖼️ PDF→រូបភាព",
  mergepdf: "➕ បញ្ចូល PDF",
  compresspdf: "📉 បង្រួម PDF",
  pdftext: "📝 អាន text ពី PDF",
  lockpdf: "🔒 ដាក់ Password",
  unlockpdf: "🔓 ដកចេញ Password",
  back: "⬅️ ត្រឡប់",
  home: "ទំព័រដើម",
  done: "✅ បញ្ចប់",
  cancel: "❌ បោះបង់",
  fmtPng: "→ PNG",
  fmtJpg: "→ JPG",
  fmtWebp: "→ WEBP",
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
  ocr: "5388946907114527048", // 🔈
  home: "5796647601105276281", // 🗂
};

const mainKeyboard = {
  keyboard: [
    [{ text: BTN.qr, icon_custom_emoji_id: EMOJI.qr }, { text: BTN.removebg }],
    [{ text: BTN.ocr, icon_custom_emoji_id: EMOJI.ocr }, { text: BTN.fontstyle }],
    [{ text: BTN.pdf, icon_custom_emoji_id: EMOJI.pdf }, { text: BTN.tts }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const pdfKeyboard = {
  keyboard: [
    [{ text: BTN.img2pdf }, { text: BTN.pdf2img }],
    [{ text: BTN.mergepdf }, { text: BTN.compresspdf }],
    [{ text: BTN.lockpdf }, { text: BTN.unlockpdf }],
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
    [{ text: BTN.home, icon_custom_emoji_id: EMOJI.home }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};


const homeKeyboard = {
  keyboard: [[{ text: BTN.home, icon_custom_emoji_id: EMOJI.home }]],
  resize_keyboard: true,
  is_persistent: true,
};



// ========== Text ==========
const T = {
  welcome:
    "👋 <b>សួស្តី! សូមស្វាគមន៍មកកាន់ Multi-Tool Bot</b>\n\n" +
    "<b>🤖 មុខងារ៖</b>\n" +
    "📱 QR Code | 🖼️ Remove BG\n" +
    "📄 PDF\n" +
    "🔊 TTS សំឡេង | 🔍 OCR អានអក្សរ\n" +
    "\n" +
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
  ocrMode: "🔍 <b>OCR</b>\n\nផ្ញើរូបភាព → អានអក្សរចេញពីរូប",
  translateMode: "🌐 <b>បកប្រែ</b>\n\nសរសេរអក្សរ → បកប្រែស្វ័យប្រវត្តិ ខ្មែរ ⇄ អង់គ្លេស",
  imgconvMode: "🎨 <b>ប្តូរ Format រូបភាព</b>\n\nផ្ញើរូបភាព រួចជ្រើសរើស format",
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

function buildQrUrl(text: string) {
  const params = new URLSearchParams({
    data: text,
    size: "400x400",
    color: "000000",
    bgcolor: "ffffff",
    format: "png",
    ecc: "H",
    margin: "2",
    qzone: "2",
    "charset-source": "UTF-8",
    "charset-target": "UTF-8",
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
  | "removebg"
  | "shorturl"
  | "pdfmenu"
  | "img2pdf"
  | "pdf2img"
  | "mergepdf"
  | "compresspdf"
  | "pdftext"
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
  | "ocr"
  | "translate"
  
  | "imgconv"
  | "imgconv_pick"
  | "fontstyle";

interface Session {
  mode: Mode;
  buffer: Uint8Array[];
  lastImage?: { bytes: Uint8Array; mime: string };
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

async function synthesizeSpeechOpus(text: string, instructions?: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text.slice(0, 4000),
        voice: "alloy",
        response_format: "opus",
        ...(instructions ? { instructions: instructions.slice(0, 500) } : {}),
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      console.error("gateway tts failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    return new Uint8Array(await res.arrayBuffer());
  } catch (e) {
    console.error("gateway tts error", e);
    return null;
  }
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

// ========== Feature: PDF → Image (via Gemini) ==========
// Splits a PDF into single-page PDFs, then asks Gemini image model to render each page as PNG.
async function extractPageAsPdf(bytes: Uint8Array, pageIndex: number): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const [copied] = await out.copyPages(src, [pageIndex]);
  out.addPage(copied);
  return await out.save();
}

async function renderPdfPageToImage(pageBytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const b64 = Buffer.from(pageBytes).toString("base64");
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
                text: "Render this single-page PDF as a high-quality PNG image. Preserve all text, layout, colors, images, and graphics exactly as they appear on the page, at the original page aspect ratio. Do NOT add, remove, or modify any content.",
              },
              { type: "file", file: { filename: "page.pdf", file_data: `data:application/pdf;base64,${b64}` } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      console.error("pdf2img error", res.status, await res.text());
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
    console.error("pdf2img exception", e);
    return null;
  }
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
          if (text === BTN.back || text === BTN.home) {
            session.mode = "idle";
            session.buffer = [];
            await tgSendMessage(chatId, T.welcome, msgId, mainKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.cancel) {
            session.buffer = [];
            const wasPdf = ["img2pdf", "pdf2img", "mergepdf", "compresspdf", "pdftext", "lockpdf", "lockpdf_password", "unlockpdf", "unlockpdf_password"].includes(session.mode);
            session.pendingPdf = undefined;
            session.mode = wasPdf ? "pdfmenu" : "idle";
            await tgSendMessage(chatId, T.cancelled, msgId, wasPdf ? pdfKeyboard : mainKeyboard);
            return Response.json({ ok: true });
          }

          if (text === BTN.qr) {
            session.mode = "qr";
            session.buffer = [];
            await tgSendMessage(chatId, T.qrMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.removebg) {
            session.mode = "removebg";
            session.buffer = [];
            await tgSendMessage(chatId, T.removebgMode, msgId, homeKeyboard);
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
          if (text === BTN.pdf2img) {
            session.mode = "pdf2img";
            session.buffer = [];
            await tgSendMessage(chatId, T.pdf2imgMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.pdftext) {
            session.mode = "pdftext";
            session.buffer = [];
            await tgSendMessage(chatId, T.pdfTextMode, msgId, homeKeyboard);
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
          if (text === BTN.ocr) {
            session.mode = "ocr";
            session.buffer = [];
            await tgSendMessage(chatId, T.ocrMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.translate) {
            session.mode = "translate";
            session.buffer = [];
            await tgSendMessage(chatId, T.translateMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.imgconv) {
            session.mode = "imgconv";
            session.buffer = [];
            session.lastImage = undefined;
            await tgSendMessage(chatId, T.imgconvMode, msgId, homeKeyboard);
            return Response.json({ ok: true });
          }
          if (text === BTN.fontstyle) {
            session.mode = "fontstyle";
            session.buffer = [];
            await tgSendMessage(chatId, T.fontstyleMode, msgId, homeKeyboard);
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

          // PDF → Image (per page, via Gemini)
          if (session.mode === "pdf2img") {
            if (!isPdfDoc) {
              await tgSendMessage(chatId, T.wrongType + " (ត្រូវការ PDF)", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            await tgTyping(chatId, "upload_photo");
            const f = await downloadTgFile(doc.file_id);
            if (!f) {
              await tgSendMessage(chatId, "❌ Download failed", msgId, pdfKeyboard);
              return Response.json({ ok: true });
            }
            try {
              const { PDFDocument } = await loadPdfLib();
              const src = await PDFDocument.load(new Uint8Array(f.bytes));
              const total = src.getPageCount();
              const MAX = 10;
              const count = Math.min(total, MAX);
              await tgSendMessage(
                chatId,
                `📄→🖼️ កំពុងបំលែង <b>${count}</b>/${total} ទំព័រ...`,
                msgId,
                pdfKeyboard,
              );
              let success = 0;
              for (let i = 0; i < count; i++) {
                const pageBytes = await extractPageAsPdf(new Uint8Array(f.bytes), i);
                const img = await renderPdfPageToImage(pageBytes);
                if (img) {
                  await tgSendPhotoBytes(
                    chatId,
                    img,
                    `page-${i + 1}.png`,
                    `📄 ទំព័រ ${i + 1}/${total}`,
                  );
                  success++;
                }
              }
              if (success === 0) {
                await tgSendMessage(chatId, "❌ បំលែងមិនបានសម្រេច", msgId, pdfKeyboard);
              } else if (total > MAX) {
                await tgSendMessage(
                  chatId,
                  `✅ បញ្ចប់ (${success}/${count} ទំព័រ)។ ⚠️ PDF នេះមាន ${total} ទំព័រ — បំលែងតែ ${MAX} ទំព័រដំបូង។`,
                  undefined,
                  pdfKeyboard,
                );
              } else {
                await tgSendMessage(chatId, `✅ បញ្ចប់ (${success}/${count} ទំព័រ)`, undefined, pdfKeyboard);
              }
            } catch (e) {
              console.error("pdf2img error", e);
              await tgSendMessage(chatId, "❌ បំលែងមិនបានសម្រេច", msgId, pdfKeyboard);
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
                if (!scanned) await tgSendMessage(chatId, T.scanError, msgId, homeKeyboard);
                else await tg("sendMessage", { chat_id: chatId, text: scanned, reply_markup: homeKeyboard });
              } catch (e) {
                console.error("qr scan error", e);
                await tgSendMessage(chatId, T.scanFail, msgId, homeKeyboard);
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
              const ogg = await synthesizeSpeechOpus(text);
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.ogg", undefined, msgId, ttsKeyboard);
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
              const ogg = await synthesizeSpeechOpus(text, session.ttsDesignInstr);
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.ogg", undefined, msgId, ttsKeyboard);
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
              const ogg = await synthesizeSpeechOpus(text);
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.ogg", undefined, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_ultra_text") {
              await tgTyping(chatId, "record_voice");
              const ogg = await synthesizeSpeechOpus(text);
              if (!ogg) await tgSendMessage(chatId, "❌ បង្កើតសំឡេងមិនបានសម្រេច", msgId, ttsKeyboard);
              else await tgSendAudioBytes(chatId, ogg, "voice.ogg", undefined, msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "tts_menu" || session.mode === "tts_clone_audio" || session.mode === "tts_ultra_audio") {
              await tgSendMessage(chatId, "⚠️ សូមផ្ញើសំឡេងគំរូជាមុន (voice message ឬឯកសារ audio)", msgId, ttsKeyboard);
              return Response.json({ ok: true });
            }
            if (session.mode === "fontstyle") {
              const input = text.trim();
              if (!input) {
                await tgSendMessage(chatId, "⚠️ សូមសរសេរអក្សរអង់គ្លេស", msgId, mainKeyboard);
                return Response.json({ ok: true });
              }
              const styles = buildFancyList(input);
              const rows = styles.map((s) => [{ text: s.value, copy_text: { text: s.value } }]);
              const body = `🅵 <b>Font Styles</b>\n<i>ចុចប៊ូតុងខាងក្រោមដើម្បី Copy</i>`;
              await tgSendMessage(chatId, body, msgId, { inline_keyboard: rows });
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

            // Default: QR (only when user selected QR mode)
            if (session.mode === "qr") {
              await tgTyping(chatId, "upload_photo");
              const url = buildQrUrl(text);
              await tgSendPhotoUrl(chatId, url, "", msgId, homeKeyboard);
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
