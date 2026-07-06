import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Multi-Tools — QR, Font Styles, PDF, TTS, OCR" },
      {
        name: "description",
        content:
          "កម្មវិធីអនឡាញឥតគិតថ្លៃ៖ បង្កើត/ស្កេន QR Code, បម្លែងអក្សរជា Font Style ស្អាតៗ, PDF Tools, TTS, OCR និងច្រើនទៀត។",
      },
      { property: "og:title", content: "Multi-Tools — QR, Font Styles, PDF, TTS, OCR" },
      { property: "og:description", content: "គ្រប់មុខងារនៅកន្លែងតែមួយ — ដំណើរការលើ browser។" },
    ],
  }),
  component: Index,
});

type Feature = {
  to: "/qr" | "/fonts" | "/tools" | "/remove-bg";
  icon: string;
  title: string;
  desc: string;
  accent: string;
};

const FEATURES: Feature[] = [
  { to: "/qr", icon: "📱", title: "QR Code", desc: "បង្កើត និងស្កេន QR", accent: "from-blue-500/20 to-blue-500/5" },
  { to: "/fonts", icon: "🅵", title: "Font Styles", desc: "អក្សរ Unicode 14 style", accent: "from-fuchsia-500/20 to-fuchsia-500/5" },
  { to: "/remove-bg", icon: "🖼️", title: "Remove BG", desc: "លុប background រូបភាព", accent: "from-emerald-500/20 to-emerald-500/5" },
  { to: "/tools", icon: "📄", title: "PDF Tools", desc: "រូបភាព↔PDF, merge, compress", accent: "from-amber-500/20 to-amber-500/5" },
  { to: "/tools", icon: "🔊", title: "TTS សំឡេង", desc: "អក្សរ → សំឡេង AI", accent: "from-pink-500/20 to-pink-500/5" },
  { to: "/tools", icon: "🔍", title: "OCR", desc: "ស្រង់អក្សរពីរូបភាព", accent: "from-cyan-500/20 to-cyan-500/5" },
];

function Index() {
  return (
    <div>
      <section className="pt-6 sm:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Web • Telegram Bot • គ្មានចាំបាច់ login
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Multi-Tools <span className="text-primary">សម្រាប់មនុស្សគ្រប់គ្នា</span>{" "}
            <span className="flame-wrap" aria-hidden="true">
              <span className="flame">🔥</span>
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            QR, Font Styles, PDF, សំឡេង AI, OCR — គ្រប់មុខងារនៅកន្លែងតែមួយ ដំណើរការភ្លាមៗលើ browser។
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/qr"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              ចាប់ផ្តើម →
            </Link>
            <Link
              to="/fonts"
              className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              សាកសង្ស Font Styles
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link
              key={i}
              to={f.to}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition hover:border-primary/40 hover:bg-card/80"
            >
              <div className={`pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br ${f.accent} opacity-0 transition group-hover:opacity-100`} />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-background/60 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                <span className="mt-4 inline-flex text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  បើកឥឡូវ →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-16 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Multi-Tools · Made with ❤️ in Cambodia
      </footer>
    </div>
  );
}
