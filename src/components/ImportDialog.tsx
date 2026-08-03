import { useRef, useState } from "react";
import {
  FileArchive,
  FolderOpen,
  Code2,
  Cpu,
  Loader2,
  Shield,
  Upload,
  X,
} from "lucide-react";
import type { Provider } from "../lib/providers";
import {
  githubProvider,
  pickFolderBrowser,
  providerFromDrop,
  providerFromFile,
} from "../lib/providers";
import { Btn, cn } from "./ui";

export function ImportDialog({
  open,
  importing,
  onClose,
  onImport,
}: {
  open: boolean;
  importing: boolean;
  onClose: () => void;
  onImport: (p: Provider | Promise<Provider>) => Promise<void>;
}) {
  const [ghUrl, setGhUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const run = async (p: Provider | null | Promise<Provider | null>) => {
    const resolved = await p;
    if (!resolved || importing) return;
    setErr(null);
    try {
      await onImport(resolved);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const browseFolder = async () => {
    const p = await pickFolderBrowser();
    if (p) return run(p);
  };

  const browseFile = async () => {
    fileRef.current?.click();
  };

  const onFileChosen = async (f: File | null) => {
    if (!f) return;
    try {
      await run(providerFromFile(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const item = e.dataTransfer.items?.[0];
    if (!item) return;
    try {
      await run(providerFromDrop(item));
    } catch (err) {
      setErr(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-fadeUp rounded-2xl border border-white/10 bg-ink-850 shadow-card">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">New analysis</h2>
            <p className="text-xs text-zinc-500">Static inspection only — no protections are bypassed.</p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {/* Drag & drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-7 text-center transition-all",
              dragOver
                ? "border-gold-400 bg-gold-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-gold-500/40"
            )}
          >
            <Upload size={22} className="text-gold-400" />
            <div className="text-sm font-medium text-zinc-200">
              Drop a folder, ZIP, APK or EXE anywhere
            </div>
            <div className="text-xs text-zinc-500">
              Folders are scanned in place · archives are extracted locally
            </div>
          </div>

          {/* Source cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={browseFolder}
              disabled={importing}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-gold-500/40 hover:bg-gold-500/5 disabled:opacity-50"
            >
              <div className="rounded-lg bg-gold-500/15 p-2 text-gold-400">
                <FolderOpen size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-100">Local folder</div>
                <div className="text-[11px] text-zinc-500">Browser folder picker</div>
              </div>
            </button>

            <button
              onClick={browseFile}
              disabled={importing}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-gold-500/40 hover:bg-gold-500/5 disabled:opacity-50"
            >
              <div className="rounded-lg bg-gold-500/15 p-2 text-gold-400">
                <FileArchive size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-100">ZIP / APK / EXE</div>
                <div className="text-[11px] text-zinc-500">Archive or binary file</div>
              </div>
            </button>
          </div>

          {/* GitHub */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Code2 size={15} className="text-gold-400" />
              GitHub repository
            </div>
            <div className="flex gap-2">
              <input
                value={ghUrl}
                onChange={(e) => setGhUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run(githubProvider(ghUrl))}
                placeholder="owner/repo or https://github.com/owner/repo"
                disabled={importing}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-gold-500/50"
              />
              <Btn
                variant="primary"
                disabled={!ghUrl.trim() || importing}
                onClick={() => run(githubProvider(ghUrl))}
              >
                Fetch
              </Btn>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-zinc-600">
              <Shield size={12} />
              Uses the public GitHub API — anonymous rate limits apply (60 req/hr).
            </div>
          </div>

          {err && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-200">
              {err}
            </div>
          )}

          {importing && (
            <div className="flex items-center gap-2 text-[13px] text-zinc-400">
              <Loader2 size={15} className="animate-spin text-gold-400" />
              Importing — this happens fully on your device…
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-zinc-500">
            <Cpu size={14} className="shrink-0 text-gold-500/70" />
            <span>
              All scanning — languages, frameworks, dependencies, security patterns — runs locally.
              Only concise summaries and the files you ask about are sent to the AI provider.
            </span>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".zip,.apk,.aab,.exe,.dll,.msi"
        className="hidden"
        onChange={(e) => {
          onFileChosen(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
