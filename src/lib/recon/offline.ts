// Heuristic, fully-offline overview and quality summaries. Shown when no AI
// key is configured so RECON AI still delivers value without the network.
import type { ProjectAnalysis } from "../types";
import { fmtBytes, fmtCount } from "../store";

export function offlineArchitecture(a: ProjectAnalysis): string {
  const lines: string[] = [];
  lines.push(`# ${a.name} — architecture overview (offline heuristics)`);
  lines.push("");
  lines.push(
    a.readmePreview
      ? `> Extracted from README:\n>\n> ${a.readmePreview
          .split("\n")
          .slice(0, 12)
          .map((l) => (l.trim().startsWith("#") ? "" : l))
          .filter((l) => l.trim())
          .join("\n> ")}`
      : "> No README detected — add one to give future readers a quick orientation."
  );
  lines.push("");
  lines.push("## What this project looks like");
  lines.push("");
  const langs = a.languages.length ? a.languages.map((l) => `${l.name} (${l.files} file${l.files > 1 ? "s" : ""})`).join(", ") : "no source files detected";
  lines.push(`- **Primary languages:** ${langs}`);
  lines.push(
    a.frameworks.length
      ? `- **Frameworks / runtimes:** ${a.frameworks.map((f) => f.name).join(", ")}`
      : "- **Frameworks:** none confidently detected"
  );
  lines.push(`- **Size:** ${fmtCount(a.fileCount)} files, ${fmtBytes(a.totalSize)}`);
  if (a.entryPoints.length) lines.push(`- **Entry points:** ${a.entryPoints.slice(0, 6).join("; ")}`);
  if (a.buildSystems.length) lines.push(`- **Build systems:** ${a.buildSystems.join(", ")}`);
  lines.push("");
  lines.push("## Top-level structure");
  lines.push("");
  const top = a.tree.filter((n) => n.isDir).slice(0, 14);
  if (top.length) {
    lines.push("```text");
    for (const d of top) {
      const files = countFiles(d);
      lines.push(`${d.name}/  (${files} file${files > 1 ? "s" : ""})`);
    }
    lines.push("```");
  }
  lines.push("");
  lines.push("## Likely data flow");
  lines.push("");
  const has = (s: string) => a.tree.some((n) => n.name.toLowerCase() === s);
  const flow: string[] = [];
  if (has("ui") || has("components") || has("pages") || has("views") || has("screens")) flow.push("UI layer (components/pages)");
  if (has("api") || has("server") || has("backend") || has("controllers") || has("routes")) flow.push("API / server layer");
  if (has("services") || has("lib") || has("core") || has("domain")) flow.push("business/services layer");
  if (has("db") || has("database") || has("models") || has("schema") || has("migrations")) flow.push("data / persistence layer");
  lines.push(flow.length ? flow.join(" → ") + " (based on folder names)" : "Folder names don't clearly map to a layered flow — consider the AI summary.");
  lines.push("");
  lines.push("> Generated locally with naming heuristics. Connect an AI provider for a");
  lines.push("> deeper, plain-English architecture explanation.");
  return lines.join("\n");
}

function countFiles(node: { isDir: boolean; children?: any[] }): number {
  if (!node.isDir) return 1;
  return (node.children ?? []).reduce((acc, c) => acc + countFiles(c), 0);
}

export function offlineQuality(a: ProjectAnalysis): string {
  const lines: string[] = [];
  lines.push(`# ${a.name} — code quality (offline heuristics)`);
  lines.push("");
  lines.push("These signals are computed locally and are *not* a substitute for a real review.");
  lines.push("");
  lines.push("## Signals");
  lines.push("");
  const srcFiles = a.flat.filter((f) => !f.isDir && /\.(ts|tsx|js|jsx|py|go|rs|java|kt|swift|cs|c|cpp|php|rb|dart)$/.test(f.path));
  const totalBytes = srcFiles.reduce((acc, f) => acc + f.size, 0);
  const avgSize = srcFiles.length ? totalBytes / srcFiles.length : 0;
  const todo = a.security.filter((f) => f.category === "Code health").length ? "some TODO/FIXME markers found" : "none detected in sampled files";
  lines.push(`- **Source files:** ${fmtCount(srcFiles.length)}`);
  lines.push(`- **Average source file size:** ${Math.round(avgSize / 1024 * 10) / 10} KB (a high average can mean monolithic files)`);
  lines.push(`- **TODO/FIXME:** ${todo}`);
  lines.push(`- **Documentation:** ${a.readmePreview ? "README present" : "no README found"}`);
  const hasTests = a.flat.some((f) => /(^|\/)(test|tests|__tests__|spec)\/|\.(test|spec)\./.test(f.path));
  lines.push(`- **Tests:** ${hasTests ? "test files detected" : "no obvious test directory or *.test.* files"}`);
  lines.push("");
  lines.push("## Suggested next steps");
  lines.push("");
  lines.push("- Add or improve a README with setup and usage instructions.");
  if (!hasTests) lines.push("- Add unit tests for the core modules (look for `api/`, `services/`, `lib/`).");
  lines.push("- Split files that have grown past ~500 lines into cohesive modules.");
  lines.push("- Resolve TODO/FIXME comments before release.");
  if (a.depSummary.unpinned.length) lines.push("- Pin dependency versions in your manifests for reproducible builds.");
  if (a.depSummary.duplicates.length) lines.push(`- Investigate duplicated libraries: ${a.depSummary.duplicates.join(", ")}.`);
  lines.push("");
  lines.push("> Connect an AI provider to get a detailed maintainability, complexity and");
  lines.push("> naming review generated from the actual code.");
  return lines.join("\n");
}
