// Builds a Mermaid flowchart that maps the project's top-level modules and
// the likely relationships between them. Edges are naming-heuristic guesses,
// clearly labelled as such.
import type { ProjectAnalysis, TreeNode } from "../types";

const KEY_MODULES = new Set([
  "src", "app", "api", "server", "backend", "frontend", "web", "mobile", "ui",
  "components", "pages", "views", "screens", "lib", "core", "utils", "helpers",
  "services", "models", "database", "db", "schema", "migrations", "controllers",
  "routes", "handlers", "middleware", "config", "constants", "types", "assets",
  "public", "static", "store", "state", "hooks", "context", "test", "tests",
  "spec", "__tests__", "docs", "scripts", "infra", "deploy", "worker", "cron",
  "auth", "graphql", "modules", "features", "domain", "infrastructure",
]);

const EDGE_RULES: Array<[string[], string[], string]> = [
  [["api", "server", "backend", "controllers", "routes", "handlers"], ["db", "database", "models", "repositories", "schema", "migrations"], "data access"],
  [["api", "server", "backend", "controllers", "routes", "services"], ["services", "lib", "core", "domain", "business", "use-cases"], "business logic"],
  [["ui", "views", "components", "pages", "screens", "widgets", "features"], ["api", "server", "services", "store", "state", "redux", "bloc", "context"], "calls"],
  [["ui", "views", "components", "pages", "screens"], ["assets", "public", "static", "styles"], "renders"],
  [["models", "schema", "migrations", "database", "db"], ["db", "database", "storage"], "persists to"],
];

const NODE_COLORS = {
  default: { fill: "#1A1A26", stroke: "#3A3A4C", text: "#D4D4DE" },
  ui: { fill: "#1C1A10", stroke: "#D4AF37", text: "#E8C15A" },
  server: { fill: "#101820", stroke: "#3B82F6", text: "#93C5FD" },
  data: { fill: "#0F1A12", stroke: "#34D399", text: "#6EE7B7" },
  entry: { fill: "#2A2208", stroke: "#F3D67A", text: "#FBE9B7" },
};

function sanitizeId(name: string): string {
  return "n" + name.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16) || "x";
}

function classify(name: string): keyof typeof NODE_COLORS {
  const l = name.toLowerCase();
  if (["ui", "views", "components", "pages", "screens", "widgets", "assets", "public", "static"].includes(l)) return "ui";
  if (["api", "server", "backend", "controllers", "routes", "handlers", "services", "middleware", "workers"].includes(l)) return "server";
  if (["db", "database", "models", "schema", "migrations", "storage", "repositories"].includes(l)) return "data";
  return "default";
}

export function buildMermaid(a: ProjectAnalysis): string {
  const root = a.tree;
  const dirs = root.filter((n) => n.isDir);

  // Select significant modules
  const selected: TreeNode[] = dirs.filter((d) => KEY_MODULES.has(d.name) || d.children.length >= 3).slice(0, 16);

  // src sub-modules
  const src = dirs.find((d) => d.name === "src" || d.name === "lib" || d.name === "app");
  const srcSubs: TreeNode[] = src ? src.children.filter((c) => c.isDir).slice(0, 10) : [];

  const nodes: Array<{ id: string; label: string; cls: keyof typeof NODE_COLORS }> = [];
  const idFor = (path: string) => {
    const existing = nodes.find((n) => n.label === path);
    return existing ? existing.id : "";
  };

  const addNode = (path: string, cls: keyof typeof NODE_COLORS) => {
    const id = sanitizeId(path) + String(nodes.length);
    nodes.push({ id, label: path, cls });
    return id;
  };

  // Root entry point file(s)
  const entryDirs = new Set(a.entryPoints.map((e) => e.split("/")[0]).filter((d) => d && !d.includes(".")));
  for (const d of selected) {
    addNode(d.path, classify(d.name));
  }
  for (const s of srcSubs) {
    addNode(s.path, classify(s.name));
  }
  // Mark entry point modules
  const entryIds = nodes.filter((n) => entryDirs.has(n.label)).map((n) => n.id);

  // Root pseudo-node for project
  const rootId = "root";
  nodes.unshift({ id: rootId, label: a.name, cls: "entry" });

  const lines: string[] = [];
  lines.push("flowchart LR");
  lines.push(`  %% RECON AI structure map for "${a.name.replace(/"/g, "'")}" — edges are heuristic`);
  for (const n of nodes) {
    const c = NODE_COLORS[n.cls];
    lines.push(
      `  ${n.id}["${n.label.replace(/"/g, "'")}"]:::${n.cls}`
    );
  }
  lines.push("");
  for (const n of nodes.slice(1)) {
    lines.push(`  ${rootId} --> ${n.id}`);
  }
  lines.push("");
  const edgeSeen = new Set<string>();
  for (const [from, to, label] of EDGE_RULES) {
    for (const a of nodes.slice(1)) {
      const an = a.label.split("/")[0];
      if (!from.includes(an)) continue;
      for (const b of nodes.slice(1)) {
        if (a.id === b.id) continue;
        const bn = b.label.split("/")[0];
        if (!to.includes(bn)) continue;
        const key = `${a.id}->${b.id}`;
        if (edgeSeen.has(key)) continue;
        edgeSeen.add(key);
        lines.push(`  ${a.id} -->|"${label} (likely)"| ${b.id}`);
      }
    }
  }
  lines.push("");
  lines.push("classDef ui fill:#1C1A10,stroke:#D4AF37,color:#E8C15A;");
  lines.push("classDef server fill:#101820,stroke:#3B82F6,color:#93C5FD;");
  lines.push("classDef data fill:#0F1A12,stroke:#34D399,color:#6EE7B7;");
  lines.push("classDef entry fill:#2A2208,stroke:#F3D67A,color:#FBE9B7,font-weight:bold;");
  lines.push("classDef default fill:#1A1A26,stroke:#3A3A4C,color:#D4D4DE;");
  if (entryIds.length) {
    lines.push(`  class ${entryIds.join(",")} entry;`);
  }
  lines.push("");
  lines.push("  %% Relationship edges above are inferred from folder naming conventions,");
  lines.push("  %% not from a static analysis of imports.");
  return lines.join("\n");
}
