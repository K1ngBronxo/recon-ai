import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText } from "lucide-react";
import type { TreeNode } from "../lib/types";
import { fmtBytes } from "../lib/store";
import { cn } from "./ui";

function Row({
  node,
  depth,
  expanded,
  toggle,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  expanded: Record<string, boolean>;
  toggle: (path: string) => void;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  const isOpen = !!expanded[node.path];
  const isSelected = selected === node.path;
  return (
    <div>
      <button
        onClick={() => (node.isDir ? toggle(node.path) : onSelect(node.path))}
        style={{ paddingLeft: 8 + depth * 14 }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg py-[3px] pr-2 text-left text-[13px] transition-colors",
          isSelected
            ? "bg-gold-500/15 text-gold-200"
            : "text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100",
          node.isDir && "font-medium"
        )}
        title={node.path}
      >
        <span className="flex w-[14px] shrink-0 items-center justify-center text-gold-500/70">
          {node.isDir ? (
            isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />
          ) : (
            <span className="w-[13px]" />
          )}
        </span>
        {node.isDir ? (
          <FolderOpen size={14} className={cn("shrink-0", isOpen ? "text-gold-400" : "text-gold-500/70")} />
        ) : (
          <FileText size={13} className="shrink-0 text-zinc-500" />
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {!node.isDir && node.size > 0 && (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-zinc-600">
            {fmtBytes(node.size)}
          </span>
        )}
      </button>
      {node.isDir && isOpen && node.children.length > 0 && (
        <div className="space-y-px">
          {node.children.map((c) => (
            <Row
              key={c.path}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  nodes,
  selected,
  onSelect,
}: {
  nodes: TreeNode[];
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    const walk = (ns: TreeNode[], d: number) => {
      for (const n of ns) {
        if (n.isDir && d < 2) {
          init[n.path] = true;
          walk(n.children, d + 1);
        }
      }
    };
    walk(nodes, 0);
    return init;
  });

  const toggle = (path: string) =>
    setExpanded((e) => ({ ...e, [path]: !e[path] }));

  return (
    <div className="space-y-px">
      {nodes.map((n) => (
        <Row
          key={n.path}
          node={n}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
