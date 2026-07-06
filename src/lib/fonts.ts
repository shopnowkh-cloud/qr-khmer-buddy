// Pure client-side fancy Unicode font converters.
// Same set as the Telegram bot's Font Styles feature.

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
  const A = 0x24b6, a = 0x24d0;
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
  return [...text].map((ch) => {
    const c = ch.codePointAt(0)!;
    if (c >= 65 && c <= 90) return String.fromCodePoint(0x1f170 + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(0x1f170 + (c - 97));
    return ch;
  }).join("");
}

function toFullwidth(text: string): string {
  return [...text].map((ch) => {
    const c = ch.codePointAt(0)!;
    if (c >= 33 && c <= 126) return String.fromCodePoint(0xff00 + (c - 32));
    if (c === 32) return "　";
    return ch;
  }).join("");
}

function toSmallCaps(text: string): string {
  const map: Record<string, string> = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
    k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ",
    u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
  };
  return [...text.toLowerCase()].map((ch) => map[ch] ?? ch).join("");
}

export type FancyStyle = { label: string; value: string };

export function buildFancyList(input: string): FancyStyle[] {
  return [
    { label: "𝗕𝗼𝗹𝗱 Sans", value: toFancy(input, 0x1d5d4, 0x1d5ee, 0x1d7ec) },
    { label: "𝘐𝘵𝘢𝘭𝘪𝘤 Sans", value: toFancy(input, 0x1d608, 0x1d622, null) },
    { label: "𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘", value: toFancy(input, 0x1d63c, 0x1d656, null) },
    { label: "𝐒𝐞𝐫𝐢𝐟 𝐁𝐨𝐥𝐝", value: toFancy(input, 0x1d400, 0x1d41a, 0x1d7ce) },
    { label: "𝑆𝑒𝑟𝑖𝑓 𝐼𝑡𝑎𝑙𝑖𝑐", value: toFancy(input, 0x1d434, 0x1d44e, null) },
    { label: "𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎", value: toFancy(input, 0x1d670, 0x1d68a, 0x1d7f6) },
    { label: "𝔻𝕠𝕦𝕓𝕝𝕖", value: toFancy(input, 0x1d538, 0x1d552, 0x1d7d8) },
    { label: "𝔉𝔯𝔞𝔨𝔱𝔲𝔯", value: toFancy(input, 0x1d504, 0x1d51e, null) },
    { label: "𝒮𝒸𝓇𝒾𝓅𝓉", value: toFancy(input, 0x1d49c, 0x1d4b6, null) },
    { label: "𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽", value: toFancy(input, 0x1d4d0, 0x1d4ea, null) },
    { label: "Sᴍᴀʟʟ Cᴀᴘs", value: toSmallCaps(input) },
    { label: "Ⓒⓘⓡⓒⓛⓔⓓ", value: toCircled(input) },
    { label: "🆂🆀🆄🅰🆁🅴🅳", value: toSquared(input) },
    { label: "Ｆｕｌｌｗｉｄｔｈ", value: toFullwidth(input) },
  ];
}
