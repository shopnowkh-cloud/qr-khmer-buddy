import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateQrPngBase64, scanQrFromBase64 } from "@/lib/qr.functions";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "QR Code Generator & Scanner — Multi-Tools" },
      { name: "description", content: "បង្កើត QR Code ពីអក្សរ/តំណ ឬស្កេន QR ពីរូបភាព ដោយឥតគិតថ្លៃ។" },
      { property: "og:title", content: "QR Code Generator & Scanner" },
      { property: "og:description", content: "បង្កើត ឬស្កេន QR ភ្លាមៗលើ browser។" },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const [tab, setTab] = useState<"gen" | "scan">("gen");
  return (
    <div>
      <PageHeader
        icon="📱"
        title="QR Code"
        subtitle="បង្កើត ឬស្កេន QR ភ្លាមៗ — គាំទ្រអក្សរខ្មែរ Unicode។"
      />
      <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1">
        <TabButton active={tab === "gen"} onClick={() => setTab("gen")}>បង្កើត QR</TabButton>
        <TabButton active={tab === "scan"} onClick={() => setTab("scan")}>ស្កេន QR</TabButton>
      </div>
      <div className="mt-6">{tab === "gen" ? <GenerateTab /> : <ScanTab />}</div>
    </div>
  );
}

function GenerateTab() {
  const [text, setText] = useState("");
  const genFn = useServerFn(generateQrPngBase64);
  const m = useMutation({
    mutationFn: (t: string) => genFn({ data: { text: t } }),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="block text-sm font-medium">អក្សរ ឬ URL</label>
        <textarea
          className="mt-2 h-40 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 focus:ring-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com ឬ សរសេរអក្សរណាមួយ"
        />
        <button
          onClick={() => text.trim() && m.mutate(text.trim())}
          disabled={!text.trim() || m.isPending}
          className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {m.isPending ? "កំពុងបង្កើត..." : "បង្កើត QR"}
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-sm font-medium">លទ្ធផល</div>
        <div className="mt-3 grid min-h-[300px] place-items-center rounded-xl border border-dashed border-border/60 bg-background/50 p-4">
          {m.data ? (
            <div className="w-full text-center">
              <img
                src={`data:${m.data.mime};base64,${m.data.base64}`}
                alt="QR Code"
                className="mx-auto max-w-xs rounded-lg bg-white p-3"
              />
              <a
                href={`data:${m.data.mime};base64,${m.data.base64}`}
                download="qr.png"
                className="mt-4 inline-flex rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                ⬇ Download PNG
              </a>
            </div>
          ) : m.isError ? (
            <p className="text-sm text-destructive">មានបញ្ហា — សូមព្យាយាមម្តងទៀត។</p>
          ) : (
            <p className="text-sm text-muted-foreground">QR របស់អ្នកនឹងបង្ហាញនៅទីនេះ</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScanTab() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scanFn = useServerFn(scanQrFromBase64);
  const m = useMutation({
    mutationFn: async (file: File) => {
      const b64 = await fileToBase64(file);
      return scanFn({ data: { base64: b64, mime: file.type || "image/png" } });
    },
  });

  const onFile = (file: File | null) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    m.mutate(file);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div
        className="rounded-2xl border border-dashed border-border bg-card p-5 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <div className="grid min-h-[240px] place-items-center">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-60 rounded-lg" />
          ) : (
            <div className="text-muted-foreground">
              <div className="text-4xl">🖼️</div>
              <p className="mt-2 text-sm">អូសរូបភាពមកទីនេះ ឬចុចជ្រើសរើស</p>
            </div>
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          ជ្រើសរើសរូបភាព
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-sm font-medium">លទ្ធផលស្កេន</div>
        <div className="mt-3 min-h-[240px] rounded-xl border border-dashed border-border/60 bg-background/50 p-4">
          {m.isPending ? (
            <p className="text-sm text-muted-foreground">កំពុងស្កេន...</p>
          ) : m.data?.text ? (
            <div>
              <p className="text-xs text-muted-foreground">អានបាន ({m.data.source})</p>
              <p className="mt-2 break-all rounded-lg bg-background p-3 font-mono text-sm">{m.data.text}</p>
              <button
                onClick={() => navigator.clipboard.writeText(m.data.text!)}
                className="mt-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
              >
                Copy
              </button>
            </div>
          ) : m.data && !m.data.text ? (
            <p className="text-sm text-destructive">❌ មិនអាចអាន QR ពីរូបនេះទេ</p>
          ) : (
            <p className="text-sm text-muted-foreground">ផ្ញើរូបភាព QR ដើម្បីអាន</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function PageHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <header className="flex items-start gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary">
        {icon}
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const s = String(fr.result || "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}
