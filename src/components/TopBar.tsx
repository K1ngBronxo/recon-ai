import { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileJson,
  FileText,
  Plus,
  Radar,
  Settings as SettingsIcon,
} from "lucide-react";
import type { Progress } from "../lib/types";
import { Btn, cn, ProgressBar } from "./ui";

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/20">
      <Radar size={20} className="text-gold-400" />
    </div>
  );
}

export function TopBar({
  progress,
  hasProject,
  onNew,
  onImport,
  onExport,
  onSettings,
  onBack,
}: {
  progress: Progress | null;
  hasProject: boolean;
  onNew: () => void;
  onImport: () => void;
  onExport: (kind: "md" | "json" | "pdf") => void;
  onSettings: () => void;
  onBack?: () => void;
}) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-ink-900/90 px-5 backdrop-blur-md">
      {onBack && (
        <button
          onClick={onBack}
          title="Back to dashboard"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-400"
        >
          <ArrowLeft size={17} />
        </button>
      )}
      <div className="flex items-center gap-3">
        <LogoMark />
        <div className="leading-tight">
          <div className="text-[16px] font-bold tracking-wide text-zinc-100">
            RECON <span className="text-gold-400">AI</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Project intelligence
          </div>
        </div>
      </div>

      <div className="ml-6 flex items-center gap-2.5">
        <Btn variant="primary" icon={<Plus size={15} />} onClick={onNew}>
          New Analysis
        </Btn>
        <Btn icon={<Plus size={15} />} onClick={onImport}>
          Import
        </Btn>
      </div>

      {progress && (
        <div className="ml-6 min-w-0 flex-1">
          <ProgressBar pct={progress.pct} label={progress.label} />
        </div>
      )}
      {!progress && hasProject && <div className="ml-6 flex-1" />}

      <div className="ml-auto flex items-center gap-2.5">
        {hasProject && (
          <div className="relative">
            <Btn icon={<Download size={15} />} onClick={() => setExportOpen((v) => !v)}>
              Export
            </Btn>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-card">
                  {[
                    { k: "md" as const, label: "Markdown report", icon: <FileText size={14} /> },
                    { k: "json" as const, label: "JSON export", icon: <FileJson size={14} /> },
                    { k: "pdf" as const, label: "Print / PDF", icon: <Download size={14} /> },
                  ].map((e) => (
                    <button
                      key={e.k}
                      onClick={() => {
                        setExportOpen(false);
                        onExport(e.k);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-zinc-300 transition-colors hover:bg-gold-500/10 hover:text-gold-200"
                    >
                      {e.icon}
                      {e.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <button
          onClick={onSettings}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-400"
          title="Settings"
        >
          <SettingsIcon size={17} />
        </button>
      </div>
    </header>
  );
}
