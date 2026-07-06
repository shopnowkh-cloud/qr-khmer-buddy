import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "More Tools — PDF, Remove BG, TTS, OCR" },
      { name: "description", content: "PDF Tools, Remove Background, TTS សំឡេង AI, OCR ស្រង់អក្សរពីរូបភាព — កំពុងរៀបចំ។" },
      { property: "og:title", content: "More Tools" },
      { property: "og:description", content: "PDF, Remove BG, TTS, OCR" },
    ],
  }),
  component: ToolsPage,
});

const TOOLS = [
  { icon: "🖼️", title: "Remove Background", desc: "លុប background រូបភាព ដោយ AI", status: "កំពុងរៀបចំ" },
  { icon: "📄", title: "PDF Tools", desc: "រូបភាព ↔ PDF, merge, compress, lock/unlock", status: "កំពុងរៀបចំ" },
  { icon: "🔊", title: "TTS សំឡេង AI", desc: "អក្សរ → សំឡេង (VoxCPM2)", status: "កំពុងរៀបចំ" },
  { icon: "🔍", title: "OCR", desc: "ស្រង់អក្សរពីរូបភាព", status: "កំពុងរៀបចំ" },
  { icon: "🌐", title: "បកប្រែ", desc: "បកប្រែ ខ្មែរ ⇄ អង់គ្លេស", status: "កំពុងរៀបចំ" },
  { icon: "🎨", title: "ប្តូរ Format រូបភាព", desc: "→ PNG / JPG / WEBP", status: "កំពុងរៀបចំ" },
];

function ToolsPage() {
  return (
    <div>
      <header className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary">🧰</div>
        <div>
          <h1 className="font-display text-2xl font-bold">មុខងារបន្ថែម</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            មុខងារខាងក្រោមអាចប្រើប្រាស់រួចហើយនៅ Telegram Bot — Web UI កំពុងរៀបចំបន្ថែម។
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <div
            key={t.title}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-background/60 text-2xl">
              {t.icon}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <span className="mt-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="font-display text-lg font-semibold">ប្រើ Telegram Bot ឥឡូវនេះ</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          មុខងារទាំងអស់ដំណើរការពេញលេញនៅលើ Telegram រួចហើយ — ស្កេនចាប់ផ្តើមភ្លាមៗ។
        </p>
      </div>
    </div>
  );
}
