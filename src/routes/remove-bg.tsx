import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { removeBgFromBase64 } from "@/lib/removebg.functions";

export const Route = createFileRoute("/remove-bg")({
  head: () => ({
    meta: [
      { title: "Remove Background — លុប background រូបភាព" },
      { name: "description", content: "លុប background រូបភាព ដោយ AI និងទាញយកជា PNG មាន transparent ។" },
      { property: "og:title", content: "Remove Background" },
      { property: "og:description", content: "លុប background រូបភាព ដោយ AI — ទាញយកជា PNG។" },
    ],
  }),
  component: RemoveBgPage,
});

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

function RemoveBgPage() {
  const runFn = useServerFn(removeBgFromBase64);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [srcName, setSrcName] = useState<string>("image");
  const [srcMime, setSrcMime] = useState<string>("image/png");
  const [srcBase64, setSrcBase64] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const mut = useMutation({
    mutationFn: async () => {
      if (!srcBase64) throw new Error("សូម upload រូបភាពមុន");
      return await runFn({ data: { base64: srcBase64, mime: srcMime } });
    },
    onSuccess: (r) => {
      setOutUrl(`data:image/png;base64,${r.base64}`);
      toast.success("លុប background រួច");
    },
    onError: (e: Error) => toast.error(e.message || "មិនបានសម្រេច"),
  });

  async function acceptFile(f: File) {
    if (!f.type.startsWith("image/")) {
      toast.error("តម្រូវឲ្យជារូបភាព");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      toast.error("រូបភាពធំពេក (អតិបរមា 15MB)");
      return;
    }
    const dataUrl = await readAsDataUrl(f);
    const comma = dataUrl.indexOf(",");
    setSrcBase64(dataUrl.slice(comma + 1));
    setSrcUrl(dataUrl);
    setSrcMime(f.type);
    setSrcName(f.name.replace(/\.[^.]+$/, "") || "image");
    setOutUrl(null);
  }

  return (
    <div>
      <Toaster />
      <header className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary">🖼️</div>
        <div>
          <h1 className="font-display text-2xl font-bold">Remove Background</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload រូបភាព → លុប background → ទាញយកជា PNG មាន transparent។
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-semibold text-muted-foreground">Input</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void acceptFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-3 flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
              dragOver ? "border-primary bg-primary/5" : "border-border bg-background/40 hover:border-primary/60"
            }`}
          >
            {srcUrl ? (
              <img src={srcUrl} alt="preview" className="max-h-64 max-w-full rounded-md object-contain" />
            ) : (
              <>
                <div className="text-3xl">📤</div>
                <p className="mt-2 text-sm font-medium">អូសទម្លាក់ ឬចុចដើម្បីជ្រើសរូបភាព</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP • អតិបរមា 15MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void acceptFile(f); }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => mut.mutate()}
              disabled={!srcBase64 || mut.isPending}
              className="flex-1"
            >
              {mut.isPending ? "កំពុងដំណើរការ…" : "លុប Background"}
            </Button>
            {srcUrl && (
              <Button
                variant="outline"
                onClick={() => { setSrcUrl(null); setSrcBase64(null); setOutUrl(null); }}
              >
                សម្អាត
              </Button>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-semibold text-muted-foreground">Result (PNG)</h2>
          <div
            className="mt-3 flex min-h-[240px] items-center justify-center rounded-xl border border-border p-4"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#1e293b 25%,transparent 25%),linear-gradient(-45deg,#1e293b 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1e293b 75%),linear-gradient(-45deg,transparent 75%,#1e293b 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
            }}
          >
            {mut.isPending ? (
              <div className="text-sm text-muted-foreground">កំពុងដំណើរការ…</div>
            ) : outUrl ? (
              <img src={outUrl} alt="result" className="max-h-64 max-w-full object-contain" />
            ) : (
              <div className="text-sm text-muted-foreground">លទ្ធផលនឹងបង្ហាញនៅទីនេះ</div>
            )}
          </div>
          {outUrl && (
            <a
              href={outUrl}
              download={`${srcName}-nobg.png`}
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ⬇ ទាញយក PNG
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
