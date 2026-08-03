import { Link } from "react-router-dom";
import { Boxes, Cpu, FileArchive, FileText, FolderOpen, Sparkles } from "lucide-react";
import { loadHistory } from "../../lib/store";
import { fmtBytes, fmtCount, fmtTime } from "../../lib/store";
import type { ProjectAnalysis } from "../../lib/types";

const KIND_ICON: Record<ProjectAnalysis["kind"], React.ReactNode> = {
  folder: <FolderOpen size={15} />,
  zip: <FileArchive size={15} />,
  github: <FileText size={15} />,
  apk: <Boxes size={15} />,
  exe: <Cpu size={15} />,
};

export function HistoryPage() {
  const history = loadHistory();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-400">History</div>
      <h1 className="mt-1.5 text-[26px] font-bold tracking-tight text-zinc-50 sm:text-[30px]">
        Your analyses
      </h1>
      <p className="mt-1 text-[14px] text-zinc-500">
        Projects you've analyzed with RECON AI, stored on this device.
      </p>

      {history.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-20 text-center">
          <FileText size={28} className="text-zinc-600" />
          <div className="mt-4 text-[16px] font-semibold text-zinc-200">Nothing here yet</div>
          <p className="mt-1.5 max-w-sm text-[13.5px] text-zinc-500">
            Import a project in the Main Tool and it will appear in your history.
          </p>
          <Link
            to="/app"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-5 py-2.5 text-[13.5px] font-semibold text-ink-950 transition hover:from-gold-300 hover:to-gold-500"
          >
            <Sparkles size={14} />
            Open Main Tool
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06]">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3.5">Project</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">Languages</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Files</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Size</th>
                <th className="px-5 py-3.5 text-right">Analyzed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((p) => (
                <tr key={p.id} className="bg-ink-900/30 transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <Link to="/app" className="group flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-400">
                        {KIND_ICON[p.kind]}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-100 group-hover:text-gold-200">{p.name}</div>
                        <div className="text-[11.5px] text-zinc-600">{p.label}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 text-zinc-400 sm:table-cell">
                    {p.languages.slice(0, 3).map((l) => l.name).join(", ") || "—"}
                  </td>
                  <td className="hidden px-5 py-4 tabular-nums text-zinc-400 md:table-cell">{fmtCount(p.fileCount)}</td>
                  <td className="hidden px-5 py-4 tabular-nums text-zinc-400 md:table-cell">{fmtBytes(p.totalSize)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-500">{fmtTime(p.importedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
