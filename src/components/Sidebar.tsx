import { FileArchive, FolderOpen, Code2, Cpu, Boxes, Trash2, FolderTree } from "lucide-react";
import type { ProjectAnalysis, TreeNode } from "../lib/types";
import { fmtBytes, fmtCount } from "../lib/store";
import { FileTree } from "./FileTree";
import { cn } from "./ui";

const KIND_ICON: Record<ProjectAnalysis["kind"], React.ReactNode> = {
  folder: <FolderOpen size={15} />,
  zip: <FileArchive size={15} />,
  github: <Code2 size={15} />,
  apk: <Boxes size={15} />,
  exe: <Cpu size={15} />,
};

const KIND_COLORS: Record<ProjectAnalysis["kind"], string> = {
  folder: "text-sky-400",
  zip: "text-purple-400",
  github: "text-emerald-400",
  apk: "text-orange-400",
  exe: "text-rose-400",
};

export function Sidebar({
  history,
  currentId,
  onSelect,
  onDelete,
  tree,
  selectedFile,
  onSelectFile,
}: {
  history: ProjectAnalysis[];
  currentId: string | null;
  onSelect: (a: ProjectAnalysis) => void;
  onDelete: (id: string) => void;
  tree: TreeNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-ink-850/60 backdrop-blur-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Projects section */}
        <div className="px-3 pt-4">
          <div className="mb-3 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <Boxes size={11} />
            Projects
          </div>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-3 py-5 text-center">
              <p className="text-[12px] text-zinc-500">
                No analyses yet
              </p>
              <p className="mt-1 text-[11px] text-zinc-600">
                Drop a folder or start a new analysis
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                    p.id === currentId
                      ? "border-gold-500/30 bg-gold-500/[0.08] shadow-sm shadow-gold-500/10"
                      : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]"
                  )}
                >
                  <span className={cn("shrink-0", p.id === currentId ? "text-gold-400" : KIND_COLORS[p.kind] ?? "text-zinc-500")}>
                    {KIND_ICON[p.kind]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-[13px] font-medium", p.id === currentId ? "text-gold-100" : "text-zinc-200")}>
                      {p.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-zinc-600">
                      <span>{fmtCount(p.fileCount)} files</span>
                      <span className="text-zinc-700">·</span>
                      <span>{fmtBytes(p.totalSize)}</span>
                      {p.languages.length > 0 && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span>{p.languages[0].name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                    title="Remove from history"
                    className="shrink-0 rounded-lg p-1.5 text-zinc-600 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File tree section */}
        {currentId && (
          <div className="mt-4 border-t border-white/[0.06] px-3 py-4">
            <div className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <FolderTree size={11} />
              Files
            </div>
            {tree.length ? (
              <FileTree nodes={tree} selected={selectedFile} onSelect={onSelectFile} />
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-3 py-5 text-center">
                <p className="text-[11px] text-zinc-600">No files in this project</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
