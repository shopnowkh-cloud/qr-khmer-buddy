import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { buildFancyList } from "@/lib/fonts";

export const Route = createFileRoute("/fonts")({
  head: () => ({
    meta: [
      { title: "Font Styles — Unicode Text Generator" },
      { name: "description", content: "បង្កើតអក្សរ Unicode 14 style — Bold, Italic, Script, Fraktur, Bubble, Squared, Fullwidth ។ Copy ភ្លាមៗ។" },
      { property: "og:title", content: "Font Styles — Unicode Text Generator" },
      { property: "og:description", content: "ចុច Copy លើ style ដែលចូលចិត្ត។" },
    ],
  }),
  component: FontsPage,
});

function FontsPage() {
  const [input, setInput] = useState("Hello 123");
  const [copied, setCopied] = useState<number | null>(null);
  const styles = useMemo(() => buildFancyList(input || " "), [input]);

  const copy = async (value: string, i: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <header className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">🅵</div>
        <div>
          <h1 className="font-display text-2xl font-bold">Font Styles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            សរសេរអក្សរអង់គ្លេស ឬលេខ → ចុច Copy លើ style ដែលអ្នកចង់បាន
          </p>
        </div>
      </header>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here…"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg outline-none ring-primary/40 focus:ring-2"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {styles.map((s, i) => (
          <button
            key={i}
            onClick={() => copy(s.value, i)}
            className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:border-primary/50 hover:bg-card/80"
          >
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="mt-1 truncate text-base">{s.value}</div>
            </div>
            <span
              className={`ml-3 shrink-0 rounded-md px-2 py-1 text-xs font-semibold transition ${
                copied === i ? "bg-primary/20 text-primary" : "bg-background text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {copied === i ? "✓ Copied" : "Copy"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
