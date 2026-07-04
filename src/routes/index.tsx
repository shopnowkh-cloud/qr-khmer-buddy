import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Khmer Multi-Tools Bot — QR, TTS, PDF & More" },
      {
        name: "description",
        content:
          "Telegram bot ភាសាខ្មែរ៖ បង្កើត QR Code, បម្លែងអក្សរទៅសំឡេង (VoxCPM2 TTS), PDF Tools, OCR, បកប្រែ, ប្តូររូបិយប័ណ្ណ ដោយឥតគិតថ្លៃ។",
      },
      { property: "og:title", content: "Khmer Multi-Tools Bot" },
      {
        property: "og:description",
        content: "Telegram bot ភាសាខ្មែរ គ្រប់មុខងារ – QR, TTS, PDF, OCR, បកប្រែ។",
      },
      { property: "og:url", content: "https://qr-khmer-buddy.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://qr-khmer-buddy.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Khmer Multi-Tools Bot",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Telegram",
          description:
            "Telegram bot ភាសាខ្មែរ គ្រប់មុខងារ – QR, TTS (VoxCPM2), PDF, OCR, បកប្រែ, ប្តូររូបិយប័ណ្ណ។",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: "📱", title: "QR Code", desc: "បង្កើត និងស្កេន QR Code រហ័ស" },
  { icon: "🔊", title: "TTS ខ្មែរ", desc: "បម្លែងអក្សរទៅសំឡេង ដោយ VoxCPM2" },
  { icon: "📄", title: "PDF Tools", desc: "រួម, បំបែក, បំលែងឯកសារ PDF" },
  { icon: "🖼️", title: "Remove BG", desc: "លុបផ្ទៃខាងក្រោយរូបភាព" },
  { icon: "🔤", title: "OCR", desc: "ស្រង់អក្សរចេញពីរូបភាព" },
  { icon: "🌐", title: "បកប្រែ", desc: "បកប្រែភាសាច្រើនប្រភេទ" },
  { icon: "💱", title: "USD ⇄ KHR", desc: "ប្តូររូបិយប័ណ្ណភ្លាមៗ" },
  { icon: "✨", title: "Voice Clone", desc: "ក្លូនសំឡេងពីឯកសារ audio" },
];

function Index() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Powered by VoxCPM2 · Telegram Bot
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Khmer Multi-Tools Bot
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            ជំនួយការ Telegram ភាសាខ្មែរ គ្រប់មុខងារក្នុងកន្លែងតែមួយ — QR, TTS, PDF,
            OCR, បកប្រែ និងច្រើនទៀត។
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              ចាប់ផ្តើមប្រើប្រាស់ Bot
            </a>
            <a
              href="https://github.com/shopnowkh-cloud/Vox-Cpm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              មើល Source Code
            </a>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            មុខងារទាំងអស់
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Khmer Multi-Tools Bot · Built with ❤️ in Cambodia</p>
        </footer>
      </section>
    </main>
  );
}
