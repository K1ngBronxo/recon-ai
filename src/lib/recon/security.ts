// Basic static security review. These are heuristic pattern matches — they
// can produce false positives and are NOT a guarantee of security.
import type { FileEntry, SecurityFinding, Severity } from "../types";
import { isTextPath } from "../providers";

type Reader = (path: string) => Promise<string | null>;

interface Pattern {
  re: RegExp;
  severity: Severity;
  category: string;
  label: string;
}

const PATTERNS: Pattern[] = [
  { re: /\bAKIA[0-9A-Z]{16}\b/g, severity: "high", category: "Cloud credential", label: "Potential AWS Access Key ID" },
  { re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b/g, severity: "high", category: "Credential", label: "Potential GitHub token" },
  { re: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g, severity: "high", category: "Credential", label: "Potential GitHub fine-grained token" },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, severity: "high", category: "Credential", label: "Potential Slack token" },
  { re: /\bsk_live_[0-9a-zA-Z]{16,}\b/g, severity: "high", category: "Payment credential", label: "Potential Stripe live secret key" },
  { re: /\bsk-[A-Za-z0-9]{20,}\b/g, severity: "high", category: "API key", label: "Potential OpenAI-style API key" },
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/g, severity: "high", category: "API key", label: "Potential Google API key" },
  { re: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/g, severity: "high", category: "Secret", label: "Embedded private key" },
  { re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: "medium", category: "Token", label: "Potential JWT token" },
  { re: /https?:\/\/[^\s/]+:[^\s/@]+@/g, severity: "high", category: "Credential", label: "Credentials embedded in a URL" },
  { re: /\b(password|passwd|pwd|secret|api[_-]?key|access[_-]?key|client[_-]?secret|token)\s*[:=]\s*["'][^"'\s]{8,}["']/gi, severity: "medium", category: "Hard-coded secret", label: "Possible hard-coded secret in assignment" },
  { re: /\b(debug|DEBUG|isDebug|DEVELOPMENT|DEVELOPER_MODE)\s*[:=]\s*true\b/g, severity: "low", category: "Debug flag", label: "Debug flag set to true" },
  { re: /allow_unsafe|unsafe_permissions|strictMode\s*[:=]\s*false|disable_strict|insecure|allow_insecure/g, severity: "low", category: "Unsafe config", label: "Unsafe configuration flag" },
];

const MAX_FILES_SCANNED = 400;
const MAX_BYTES_TOTAL = 10 * 1024 * 1024;
const MAX_FILE_BYTES = 400 * 1024;

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

export async function runSecurityScan(
  files: FileEntry[],
  reader: Reader
): Promise<{ findings: SecurityFinding[]; stats: { filesScanned: number; bytesScanned: number } }> {
  const findings: SecurityFinding[] = [];
  let filesScanned = 0;
  let bytesScanned = 0;
  const fileByPath = new Map(files.map((f) => [f.path, f] as const));

  const scanFile = async (path: string, force: boolean) => {
    const f = fileByPath.get(path);
    if (!f || f.isDir) return;
    if (f.size > MAX_FILE_BYTES && !force) return;
    if (filesScanned >= MAX_FILES_SCANNED) return;
    const text = await reader(path);
    if (text === null || text === undefined) return;
    if (text.length > 1_500_000) return;
    filesScanned++;
    bytesScanned += text.length;

    for (const p of PATTERNS) {
      const re = new RegExp(p.re.source, p.re.flags.replace("g", "") + "g");
      const matches = text.match(re);
      if (!matches) continue;
      const firstIdx = text.search(re);
      findings.push({
        severity: p.severity,
        category: p.category,
        message: `${p.label} (${matches.length} match${matches.length > 1 ? "es" : ""})`,
        file: path,
        line: firstIdx >= 0 ? lineOf(text, firstIdx) : undefined,
        evidence: matches.slice(0, 3).map((m) => (m.length > 40 ? m.slice(0, 40) + "…" : m)).join(" | "),
      });
    }

    if (/\.env(\.|$)/i.test(path)) {
      findings.push({
        severity: /\.env$/.test(path) && text.length > 0 ? "medium" : "low",
        category: "Environment file",
        message: "Environment file present in the project — check it for real secrets before sharing.",
        file: path,
      });
    }
  };

  // 1. Always scan .env files and common config
  const envFiles = files.filter((f) => !f.isDir && /(^|\/)(\.env|\.env\..*)$/.test(f.path));
  for (const e of envFiles.slice(0, 10)) await scanFile(e.path, true);

  // 2. Scan a sample of text files
  const candidates = files
    .filter((f) => !f.isDir && isTextPath(f.path) && f.size <= MAX_FILE_BYTES)
    .sort((a, b) => (a.path.startsWith(".") ? -1 : b.path.startsWith(".") ? 1 : a.path.localeCompare(b.path)));
  for (const f of candidates) {
    if (bytesScanned > MAX_BYTES_TOTAL || filesScanned >= MAX_FILES_SCANNED) break;
    if (envFiles.some((e) => e.path === f.path)) continue;
    await scanFile(f.path, false);
  }

  // 3. Structural findings
  const todoCount = await countComments(files, reader, /\b(TODO|FIXME|HACK|XXX)\b/g, 40);
  if (todoCount > 0) {
    findings.push({
      severity: "info",
      category: "Code health",
      message: `${todoCount} TODO/FIXME markers found in the codebase (sampled).`,
    });
  }
  if (!files.some((f) => f.path === ".gitignore" || f.path.endsWith("/.gitignore"))) {
    findings.push({
      severity: "low",
      category: "Hygiene",
      message: "No .gitignore found — build artifacts or secrets could be committed accidentally.",
    });
  }
  const bigBinaries = files.filter((f) => !f.isDir && f.size > 10 * 1024 * 1024 && !/\.(png|jpe?g|gif|webp|mp4|mp3|wav|zip|jar|aab|apk|exe|dll|so|dylib|ttf|woff2?|pdf)$/i.test(f.path));
  for (const b of bigBinaries.slice(0, 5)) {
    findings.push({
      severity: "info",
      category: "Embedded binary",
      message: `Large embedded file (${(b.size / 1024 / 1024).toFixed(1)} MB) — verify it belongs in the repository.`,
      file: b.path,
    });
  }
  const lockFiles = files.filter((f) => !f.isDir && /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|composer\.lock|Cargo\.lock)$/.test(f.path));
  if (lockFiles.length) {
    findings.push({
      severity: "info",
      category: "Reproducibility",
      message: `${lockFiles.length} lockfile(s) found — good for reproducible builds.`,
    });
  }

  // Severity ordering
  const rank: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity]);
  return { findings, stats: { filesScanned, bytesScanned } };
}

async function countComments(
  files: FileEntry[],
  reader: Reader,
  re: RegExp,
  max: number
): Promise<number> {
  let count = 0;
  const candidates = files
    .filter((f) => !f.isDir && isTextPath(f.path) && f.size < 200 * 1024)
    .slice(0, 120);
  for (const f of candidates) {
    const text = await reader(f.path);
    if (!text) continue;
    const matches = text.match(re);
    if (matches) {
      count += matches.length;
      if (count >= max) break;
    }
  }
  return count;
}
