import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Moon, Sun, Menu, X, Github, ExternalLink, Send, Mail, User, MessageSquare,
  Code2, Sparkles, Zap, Bot, Braces, Server, Palette, Rocket,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lim Sovannrady — Developer Portfolio" },
      { name: "description", content: "អ្នកអភិវឌ្ឍន៍កម្មវិធីកម្រិតខ្ពស់ — React, TypeScript, Node.js, Telegram Bots ។ បង្កើតបទពិសោធន៍ឌីជីថលដ៏អស្ចារ្យ។" },
    ],
  }),
  component: Portfolio,
});

/* ---------- Theme toggle ---------- */
function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return { dark, toggle };
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="group relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card/60 backdrop-blur transition hover:scale-110 hover:border-primary"
    >
      <Sun className={`absolute h-5 w-5 text-amber-500 transition-all ${dark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
      <Moon className={`absolute h-5 w-5 text-primary transition-all ${dark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"}`} />
    </button>
  );
}

/* ---------- Nav ---------- */
const NAV = [
  { href: "#home", label: "ដើម" },
  { href: "#about", label: "អំពីខ្ញុំ" },
  { href: "#projects", label: "គម្រោង" },
  { href: "#contact", label: "ទំនាក់ទំនង" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-violet-glow)] text-white shadow-lg">
            <Code2 className="h-5 w-5" />
          </span>
          <span className="text-gradient">Sovannrady</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((l) => (
            <a key={l.href} href={l.href}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card/60 md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-up">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */
function CodeSim() {
  const lines = [
    { t: "const", a: " developer", b: " = ", v: "{" },
    { pad: true, k: "  name:", v: " 'Lim Sovannrady'," },
    { pad: true, k: "  stack:", v: " ['React', 'TS', 'Node']," },
    { pad: true, k: "  craft:", v: " 'premium UX'," },
    { t: "}", a: ";", b: "", v: "" },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[var(--color-neon)]/25 via-transparent to-[var(--color-violet-glow)]/25 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-border glass p-1 shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-xs text-muted-foreground">developer.ts</span>
        </div>
        <pre className="overflow-hidden px-6 py-6 font-mono text-sm leading-7">
{lines.map((l, i) => (
  <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
    {l.pad ? (
      <><span className="text-[var(--color-violet-glow)]">{l.k}</span><span className="text-emerald-500 dark:text-emerald-400">{l.v}</span></>
    ) : (
      <><span className="text-[var(--color-neon)]">{l.t}</span><span>{l.a}</span><span className="text-muted-foreground">{l.b}</span><span>{l.v}</span></>
    )}
  </div>
))}
          <span className="inline-block h-4 w-2 translate-y-0.5 bg-primary animate-blink" />
        </pre>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--color-neon)]/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[var(--color-violet-glow)]/20 blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-2xl border border-border glass animate-spin-slow" />
      <div className="pointer-events-none absolute -bottom-6 -left-4 h-12 w-12 rounded-full border border-border glass animate-float-slow" />
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-14 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--color-neon)]/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-[var(--color-violet-glow)]/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-neon)]" />
            Available for premium projects
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            សួស្តី! ខ្ញុំជា
            <br />
            <span className="text-gradient">អ្នកអភិវឌ្ឍន៍កម្មវិធីកម្រិតខ្ពស់</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            បង្កើតបទពិសោធន៍ឌីជីថលដ៏អស្ចារ្យ តាមរយៈកូដដែលមានរចនាសម្ព័ន្ធស្អាត និងបច្ចេកវិទ្យាទំនើប។
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-violet-glow)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-violet-glow)]/25 transition hover:scale-[1.03]">
              <Rocket className="h-4 w-4" /> មើលគម្រោងរបស់ខ្ញុំ
            </a>
            <a href="#contact"
              className="neon-border inline-flex items-center gap-2 rounded-xl bg-card/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card">
              <Mail className="h-4 w-4" /> ទាក់ទងខ្ញុំ
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div><span className="block text-2xl font-bold text-foreground">5+</span> ឆ្នាំបទពិសោធន៍</div>
            <div><span className="block text-2xl font-bold text-foreground">30+</span> គម្រោងបញ្ចប់</div>
            <div><span className="block text-2xl font-bold text-foreground">100%</span> គុណភាពខ្ពស់</div>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
          <CodeSim />
        </div>
      </div>
    </section>
  );
}

/* ---------- About & Skills ---------- */
const SKILLS = [
  { name: "JavaScript", icon: Braces, color: "text-yellow-500" },
  { name: "TypeScript", icon: Code2, color: "text-sky-500" },
  { name: "React", icon: Zap, color: "text-cyan-500" },
  { name: "Node.js", icon: Server, color: "text-emerald-500" },
  { name: "Tailwind CSS", icon: Palette, color: "text-teal-500" },
  { name: "Telegram Bot API", icon: Bot, color: "text-blue-500" },
];

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <p className="text-sm font-medium text-primary">អំពី</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">អំពីខ្ញុំ និង ជំនាញ</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-up">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-violet-glow)] text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">មនុស្សម្នាក់ដែលចូលចិត្តរចនាកូដស្អាត</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            ខ្ញុំមានចំណង់ចំណូលចិត្តខ្លាំងលើ clean architecture, interactive UI,
            web automation និងបទពិសោធន៍ឌីជីថលដែលមានគុណភាពខ្ពស់។
            ខ្ញុំតែងតែស្វែងរកមធ្យោបាយថ្មីៗ ដើម្បីធ្វើឱ្យផលិតផលកាន់តែឆ្លាតវៃ លឿន និងស្រស់ស្អាត។
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {["Clean Code", "UI/UX", "Automation", "Bots"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SKILLS.map((s, i) => (
            <div key={s.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-xl dark:hover:shadow-[var(--color-neon)]/10 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 dark:group-hover:animate-glow-pulse rounded-2xl" />
              <s.icon className={`h-8 w-8 ${s.color} transition group-hover:scale-110`} />
              <div className="mt-4 text-sm font-semibold">{s.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">Expert level</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Projects ---------- */
type Project = {
  title: string;
  desc: string;
  tags: string[];
  cat: "Web Apps" | "Automation";
  hue: string;
  demo: string;
  code: string;
};

const PROJECTS: Project[] = [
  { title: "Multi-Tools Web App", desc: "កម្មវិធីអនឡាញរួមមុខងារ QR, PDF, TTS និង OCR គ្រប់មុខងារនៅកន្លែងតែមួយ។", tags: ["React", "TanStack", "Tailwind"], cat: "Web Apps", hue: "from-cyan-500/30 to-violet-500/30", demo: "#", code: "#" },
  { title: "Telegram AI Bot", desc: "Bot ភាសាខ្មែរដែលប្រើ AI សម្រាប់ TTS, OCR, បកប្រែ និង PDF Tools។", tags: ["Node.js", "Telegram API", "AI"], cat: "Automation", hue: "from-blue-500/30 to-sky-500/30", demo: "#", code: "#" },
  { title: "E-Commerce Dashboard", desc: "ផ្ទាំងគ្រប់គ្រងហាងទំនិញ realtime ជាមួយ analytics ស្រស់ស្អាត។", tags: ["React", "TypeScript", "Charts"], cat: "Web Apps", hue: "from-emerald-500/30 to-teal-500/30", demo: "#", code: "#" },
  { title: "Auto Content Publisher", desc: "ស្គ្រីបស្វ័យប្រវត្តិសម្រាប់ផ្សព្វផ្សាយមាតិកាទៅ social platforms ច្រើន។", tags: ["Node.js", "Automation", "API"], cat: "Automation", hue: "from-amber-500/30 to-rose-500/30", demo: "#", code: "#" },
  { title: "Portfolio Studio", desc: "គេហទំព័រ Portfolio កម្រិតខ្ពស់ជាមួយ dark/light mode និង animations។", tags: ["React", "Tailwind", "Motion"], cat: "Web Apps", hue: "from-fuchsia-500/30 to-purple-500/30", demo: "#", code: "#" },
  { title: "QR Payment Bot", desc: "ប្រព័ន្ធ Bot ស្គេន QR និងបញ្ជាក់ការទូទាត់ដោយស្វ័យប្រវត្តិ។", tags: ["Bot API", "OCR", "Node.js"], cat: "Automation", hue: "from-indigo-500/30 to-blue-500/30", demo: "#", code: "#" },
];

const CATS = ["All", "Web Apps", "Automation"] as const;

function Projects() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const list = PROJECTS.filter((p) => cat === "All" || p.cat === cat);
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-primary">ស្នាដៃ</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">ស្នាដៃ និង គម្រោងលេចធ្លោ</h2>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              cat === c
                ? "border-transparent bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-violet-glow)] text-white shadow-lg"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <article key={p.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-2 hover:border-primary hover:shadow-2xl dark:hover:shadow-[var(--color-neon)]/10 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${p.hue}`}>
              <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full opacity-60 mix-blend-overlay">
                <defs>
                  <pattern id={`g${i}`} width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M0 16 L16 0" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="200" height="120" fill={`url(#g${i})`} className="text-white/60" />
                <circle cx={40 + i * 20} cy="60" r="30" fill="white" opacity="0.15" />
                <circle cx={160 - i * 15} cy="40" r="20" fill="white" opacity="0.15" />
              </svg>
              <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
                {p.cat}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <a href={p.demo} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
                  <ExternalLink className="h-3.5 w-3.5" /> Demo
                </a>
                <a href={p.code} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
function Contact() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };
  const Field = ({ id, label, icon: Icon, type = "text", textarea = false }: {
    id: string; label: string; icon: typeof User; type?: string; textarea?: boolean;
  }) => (
    <div className="group relative">
      <label htmlFor={id} className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </label>
      {textarea ? (
        <textarea id={id} rows={5} required
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
      ) : (
        <input id={id} type={type} required
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
      )}
    </div>
  );

  return (
    <section id="contact" className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-primary">ទំនាក់ទំនង</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">ចាប់ផ្តើមគម្រោងជាមួយគ្នា</h2>
        <p className="mt-3 text-muted-foreground">មានគំនិតល្អទេ? សរសេរមកខ្ញុំ ហើយយើងនឹងធ្វើឱ្យវាកើតឡើង។</p>
      </div>

      <form onSubmit={onSubmit} className="glass rounded-3xl p-6 sm:p-10 animate-fade-up">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="name" label="ឈ្មោះ" icon={User} />
          <Field id="email" label="អ៊ីម៉ែល" icon={Mail} type="email" />
        </div>
        <div className="mt-5">
          <Field id="message" label="សារ" icon={MessageSquare} textarea />
        </div>
        <button type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-violet-glow)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-violet-glow)]/25 transition hover:scale-[1.01] sm:w-auto">
          <Send className="h-4 w-4" /> {sent ? "បានផ្ញើ! សូមអរគុណ" : "ផ្ញើសារ"}
        </button>
      </form>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-2xl font-extralight tracking-widest text-gradient">Lim Sovannrady</p>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
function Portfolio() {
  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}
