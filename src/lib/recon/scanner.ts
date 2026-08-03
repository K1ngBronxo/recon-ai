// The scan pipeline: turns any Provider (folder, zip, github, apk, exe) into
// a complete ProjectAnalysis. All detection runs locally; AI sections are
// generated on demand by the UI, never blocking the import.
import type { FileEntry, Progress, ProjectAnalysis, TreeNode } from "../types";
import type { Provider } from "../providers";
import { isTextPath } from "../providers";
import { uid } from "../store";
import { detectBuildSystems, detectConfigFiles, detectEntryPoints, detectFrameworks, detectLanguages, readReadme } from "./detect";
import { parseDependencies } from "./deps";
import { runSecurityScan } from "./security";

export function createReader(p: Provider) {
  const cache = new Map<string, string | null>();
  return async (path: string): Promise<string | null> => {
    if (cache.has(path)) return cache.get(path)!;
    const v = await p.readText(path).catch(() => null);
    cache.set(path, v);
    return v;
  };
}

export function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();
  for (const f of files) {
    const parts = f.path.split("/");
    let level = root;
    let cur = "";
    for (let i = 0; i < parts.length; i++) {
      cur = cur ? `${cur}/${parts[i]}` : parts[i];
      const last = i === parts.length - 1;
      let node = map.get(cur);
      if (!node) {
        node = {
          name: parts[i],
          path: cur,
          isDir: last ? f.isDir : true,
          size: last && !f.isDir ? f.size : 0,
          children: [],
        };
        map.set(cur, node);
        level.push(node);
      }
      if (!last) level = node.children;
    }
  }
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));
    for (const n of nodes) sort(n.children);
  };
  sort(root);
  return root;
}

export async function analyzeProject(
  p: Provider,
  onProgress?: (pr: Progress) => void
): Promise<ProjectAnalysis> {
  const step = (pct: number, label: string) => onProgress?.({ pct, label });

  step(4, "Loading source…");
  const files = await p.load((l) => step(6, l));

  step(12, "Building file tree…");
  const tree = buildTree(files);

  step(18, "Detecting languages…");
  const languages = detectLanguages(files);

  const reader = createReader(p);

  step(26, "Detecting frameworks…");
  const frameworks = await detectFrameworks(reader, files);

  step(36, "Parsing dependencies…");
  const { deps, manifests, summary: depSummary } = await parseDependencies(reader, files);

  step(48, "Finding entry points…");
  const entryPoints = await detectEntryPoints(reader, files);

  step(55, "Scanning build & config…");
  const buildSystems = detectBuildSystems(files);
  const configFiles = detectConfigFiles(files);
  const readmePreview = await readReadme(reader, files);

  step(68, "Running security scan…");
  const { findings: security, stats: scanStats } = await runSecurityScan(files, reader);

  step(92, "Finalizing…");

  const totalSize = files.filter((f) => !f.isDir).reduce((acc, f) => acc + f.size, 0);
  const notes = [...p.notes];
  if (files.length >= 50000) notes.push("File listing capped at 50,000 entries.");
  const textCandidates = files.filter((f) => !f.isDir && isTextPath(f.path) && f.size <= 400 * 1024).length;
  if (scanStats.filesScanned < textCandidates && textCandidates > 0) {
    notes.push("Security scan sampled a subset of files to stay fast — run exports for the full picture.");
  }

  const analysis: ProjectAnalysis = {
    id: uid(),
    name: p.name,
    kind: p.kind,
    label: p.label,
    importedAt: Date.now(),
    fileCount: files.filter((f) => !f.isDir).length,
    totalSize,
    notes,
    sourceMeta: p.meta,
    flat: files.slice(0, 50000),
    tree,
    languages,
    frameworks,
    manifests,
    deps,
    depSummary,
    entryPoints,
    buildSystems,
    configFiles,
    readmePreview,
    security,
    scanStats,
    architecture: null,
    quality: null,
    readme: null,
  };

  step(100, "Done");
  return analysis;
}
