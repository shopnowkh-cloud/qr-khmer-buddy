# Web UI សម្រាប់ Multi-Tool Bot

បង្កើត web interface ដែលមានមុខងារដូចគ្នានឹង Telegram bot — មិនចាំបាច់ login, ប្រើ Dark Modern theme (bg #0F172A, accent #3B82F6)។

## Routes

```
/                    → Landing + feature grid (dashboard-style)
/qr                  → QR generate & scan
/image-tools         → Remove BG, Format converter, Font Styles (tabs)
/pdf                 → PDF Tools hub (tabs for img↔PDF, merge, compress, lock/unlock, text)
/ai                  → TTS + OCR (tabs)
```

រាល់ route មាន head() ផ្ទាល់ (title/description/og), navbar រួម (in `__root.tsx`)។

## Server functions (មិនកែ webhook.ts)

បង្កើត `src/lib/tools.functions.ts` ដែល expose៖
- `generateQr({ text })` → base64 PNG
- `scanQr({ imageBase64 })` → decoded text
- `removeBg({ imageBase64 })` → PNG bytes (Gemini image model, ដូច bot)
- `convertImage({ imageBase64, format })` → bytes
- `imagesToPdf({ images[] })`, `mergePdfs({ pdfs[] })`, `compressPdf`, `lockPdf`, `unlockPdf`, `pdfToImages`, `pdfToText`
- `synthesizeSpeech({ text, mode, voiceRef?, instruction? })` → OGG bytes
- `ocrImage({ imageBase64 })` → text
- `fancyFonts({ text })` → `{ label, value }[]` (pure client-side actually — inline in component)

Extract shared logic ពី `webhook.ts` ទៅ `src/lib/tools-core.ts` (pure functions), បន្ទាប់មក wrap ជា `createServerFn` នៅ `tools.functions.ts` និង re-use ក្នុង webhook។

## Components

- `<ToolCard>` — feature tile នៅ home
- `<FileDropzone>` — drag-drop upload → base64
- `<ResultViewer>` — image/audio/text/PDF preview + download button
- `<CopyButton>` — សម្រាប់ font styles
- `<Tabs>` — shadcn tabs សម្រាប់ sub-tools

## Design (Dark Modern)

- CSS tokens ក្នុង `src/styles.css`៖ `--background: #0F172A`, `--foreground: #F1F5F9`, `--primary: #3B82F6`, `--muted: #94A3B8`, `--card: #1E293B`
- Layout៖ centered container max-w-6xl, sticky glass navbar, feature grid on home
- Typography៖ Inter (body) + Space Grotesk (heading) via @fontsource

## Technical Notes

- មិន touch `webhook.ts` — Telegram bot នៅដដែល
- File upload → convert ទៅ base64 ក្នុង browser → POST ជា server function → return bytes as base64 → download link
- Toast notifications (sonner) សម្រាប់ error/success
- Loading states with skeleton/spinner

## Out of scope

- Login/auth
- History/saved files (មិន persist)
- User accounts, quotas