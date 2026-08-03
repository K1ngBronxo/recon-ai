// File providers: every import source (local folder, ZIP, GitHub, APK, EXE)
// exposes the same Provider contract so the scanner stays source-agnostic.
// Everything runs entirely in the browser — no native shell required.
import { unzipSync, strFromU8 } from "fflate";
import type { FileEntry, SourceKind } from "./types";

export interface Provider {
  kind: SourceKind;
  name: string;
  label: string;
  notes: string[];
  meta?: Record<string, string>;
  load: (onStep?: (label: string) => void) => Promise<FileEntry[]>;
  readText: (path: string) => Promise<string | null>;
}

// ---------------------------------------------------------------------------
// Path / content helpers
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "target",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  ".tox",
  ".cache",
  ".mypy_cache",
  ".pytest_cache",
  ".gradle",
  "bower_components",
  "vendor",
  "Pods",
  "DerivedData",
  ".dart_tool",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".hg",
  ".svn",
  ".idea",
  ".terraform",
  ".yarn",
  ".turbo",
]);

const TEXT_EXTS = new Set([
  ".txt", ".md", ".markdown", ".json", ".json5", ".jsonc", ".ts", ".tsx", ".mts",
  ".js", ".jsx", ".mjs", ".cjs", ".py", ".pyi", ".go", ".rs", ".c", ".h", ".cpp",
  ".cc", ".cxx", ".hpp", ".cs", ".java", ".kt", ".kts", ".swift", ".dart", ".php",
  ".rb", ".erb", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".sh", ".bash",
  ".zsh", ".ps1", ".bat", ".cmd", ".html", ".htm", ".css", ".scss", ".less", ".xml",
  ".svg", ".gradle", ".properties", ".env", ".lock", ".vue", ".svelte", ".sql",
  ".graphql", ".gql", ".proto", ".plist", ".eslintrc", ".prettierrc", ".babelrc",
  ".editorconfig", ".npmrc", ".pem", ".crt", ".log", ".csv", ".tsv", ".csproj",
  ".sln", ".xaml", ".tf", ".tfvars", ".mk", ".cmake", ".ipynb", ".sol", ".jl",
  ".scala", ".ex", ".exs", ".hs", ".clj", ".zig", ".nim", ".lua", ".pl", ".r",
  ".dockerfile", ".lockb", ".hbs", ".ejs", ".twig", ".astro", ".liquid", ".rss",
]);

const TEXT_BASENAMES = new Set([
  "Dockerfile", "Makefile", "README", "LICENSE", "Gemfile", "Procfile",
  "Vagrantfile", "Rakefile", "Jenkinsfile", "Containerfile", "Gopkg.lock",
]);

export function isTextPath(path: string): boolean {
  const base = path.split("/").pop() ?? "";
  if (TEXT_BASENAMES.has(base)) return true;
  const dot = base.lastIndexOf(".");
  if (dot > 0) return TEXT_EXTS.has(base.slice(dot).toLowerCase());
  return base.startsWith(".");
}

export function bytesToText(bytes: Uint8Array): string | null {
  const sample = bytes.subarray(0, Math.min(bytes.length, 8192));
  for (const b of sample) if (b === 0) return null;
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

const MAX_FILES = 50000;

function memoRead(readText: (p: string) => Promise<string | null>) {
  const cache = new Map<string, string | null>();
  return async (path: string): Promise<string | null> => {
    if (cache.has(path)) return cache.get(path)!;
    const v = await readText(path).catch(() => null);
    cache.set(path, v);
    return v;
  };
}

// ---------------------------------------------------------------------------
// Browser: File System Access API (used in the webview / Chrome preview)
// ---------------------------------------------------------------------------

export async function filesFromHandle(
  handle: FileSystemDirectoryHandle,
  limit = MAX_FILES
): Promise<FileEntry[]> {
  const out: FileEntry[] = [];
  let count = 0;
  async function walk(dir: FileSystemDirectoryHandle, prefix: string) {
    for await (const [name, child] of (dir as any).entries()) {
      if (count >= limit) return;
      const rel = prefix ? `${prefix}/${name}` : name;
      if (child.kind === "directory") {
        if (SKIP_DIRS.has(name)) continue;
        out.push({ path: rel, isDir: true, size: 0 });
        await walk(child, rel);
      } else {
        let size = 0;
        try {
          size = (await child.getFile()).size;
        } catch {
          /* permission or IO error */
        }
        out.push({ path: rel, isDir: false, size });
        count++;
      }
    }
  }
  await walk(handle, "");
  return out;
}

export function browserFolderProvider(handle: FileSystemDirectoryHandle): Provider {
  return {
    kind: "folder",
    name: handle.name,
    label: "Local folder",
    notes: [
      "Scanned through the browser File System Access API.",
      "node_modules, build output, .git and other noise directories are skipped.",
    ],
    async load(onStep) {
      onStep?.("Reading folder…");
      return filesFromHandle(handle);
    },
    readText: (() => {
      const cache = new Map<string, string | null>();
      return async (path: string) => {
        if (cache.has(path)) return cache.get(path)!;
        let parts = path.split("/");
        let h: FileSystemDirectoryHandle | FileSystemFileHandle = handle;
        for (const p of parts.slice(0, -1)) h = await (h as FileSystemDirectoryHandle).getDirectoryHandle(p);
        let value: string | null = null;
        try {
          const file = await (h as FileSystemDirectoryHandle).getFileHandle(parts[parts.length - 1]);
          const bytes = new Uint8Array(await (await file.getFile()).arrayBuffer());
          value = bytesToText(bytes);
        } catch {
          value = null;
        }
        cache.set(path, value);
        return value;
      };
    })(),
  };
}

// ---------------------------------------------------------------------------
// ZIP archive
// ---------------------------------------------------------------------------

export function zipProvider(bytes: Uint8Array, name: string, kind: SourceKind): Provider {
  let zipped: Record<string, Uint8Array> | null = null;
  return {
    kind,
    name,
    label: kind === "apk" ? "Android APK" : kind === "exe" ? "Windows executable" : "ZIP archive",
    notes: ["Extracted archive — binary entries are listed but not decoded."],
    load(onStep) {
      onStep?.("Extracting archive…");
      return new Promise((resolve) => {
        setTimeout(() => {
          zipped = unzipSync(bytes);
          const files: FileEntry[] = Object.keys(zipped)
            .filter((p) => !p.endsWith("/"))
            .map((p) => ({ path: p, isDir: false, size: zipped![p].length }));
          resolve(files);
        }, 10);
      });
    },
    readText: memoRead(async (path: string) => {
      const b = zipped?.[path];
      if (!b) return null;
      return bytesToText(b);
    }),
  };
}

// ---------------------------------------------------------------------------
// GitHub repository
// ---------------------------------------------------------------------------

async function ghJson(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "RECON-AI" },
  });
  if (!res.ok) {
    let msg = `GitHub API error ${res.status}`;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {
      /* keep default */
    }
    throw new Error(msg);
  }
  return res.json();
}

export function normalizeRepo(input: string): string {
  let s = input.trim();
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  s = s.replace(/\.git$/i, "");
  return s.replace(/\/+$/, "");
}

export async function githubProvider(repoInput: string): Promise<Provider> {
  const repo = normalizeRepo(repoInput);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error("Invalid GitHub repository. Use format owner/repo or a full URL.");
  }
  const info = await ghJson(`https://api.github.com/repos/${repo}`);
  const branch = info?.default_branch ?? "HEAD";
  const tree = await ghJson(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`);
  const blobs: any[] = (tree.tree ?? []).filter((t: any) => t.type === "blob");
  if (!blobs.length) {
    throw new Error("No files found — the repository or branch may be empty or private.");
  }
  const files: FileEntry[] = blobs.map((t: any) => ({
    path: t.path,
    isDir: false,
    size: t.size ?? 0,
  }));
  const notes: string[] = ["Fetched via the GitHub API (metadata only, no commit history)."];
  if (tree.truncated) notes.push("Repository tree was truncated by the GitHub API — the listing is incomplete.");
  const readText = memoRead(async (path: string) => {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`, {
        headers: { "User-Agent": "RECON-AI" },
      });
      if (!res.ok) return null;
      const text = await res.text();
      return text.length > 1_500_000 ? text.slice(0, 1_500_000) : text;
    } catch {
      return null;
    }
  });
  return {
    kind: "github",
    name: repo,
    label: `GitHub (${branch})`,
    notes,
    meta: {
      Repository: repo,
      Branch: branch,
      "Default branch": info?.default_branch ?? "unknown",
      Description: info?.description ?? "—",
      Stars: info?.stargazers_count != null ? String(info.stargazers_count) : "—",
      "Open issues": info?.open_issues_count != null ? String(info.open_issues_count) : "—",
      License: info?.license?.spdx_id ?? "—",
    },
    async load(onStep) {
      onStep?.("Fetching repository tree…");
      return files;
    },
    readText,
  };
}

// ---------------------------------------------------------------------------
// APK: ZIP + binary AndroidManifest.xml string-pool extraction
// ---------------------------------------------------------------------------

export function parseBinaryXmlStrings(bytes: Uint8Array): string[] {
  const out: string[] = [];
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let off = 0;
  while (off + 8 <= bytes.length) {
    const type = dv.getUint16(off, true);
    const chunkSize = dv.getUint32(off + 4, true);
    if (chunkSize < 8 || off + chunkSize > bytes.length) break;
    if (type === 0x0001) {
      // RES_STRING_POOL_TYPE
      try {
        const stringCount = dv.getUint32(off + 8, true);
        const flags = dv.getUint32(off + 16, true);
        const stringsStart = dv.getUint32(off + 20, true);
        const isUtf8 = (flags & 0x100) !== 0;
        for (let i = 0; i < stringCount && i < 20000; i++) {
          const strOff = dv.getUint32(off + 28 + i * 4, true);
          const p = off + stringsStart + strOff;
          if (p < 0 || p + 1 > bytes.length) continue;
          if (isUtf8) {
            let len = bytes[p];
            let q = p + 1;
            if (len & 0x80) {
              len = ((len & 0x7f) << 8) | bytes[q];
              q += 1;
            }
            if (q + len <= bytes.length) {
              out.push(new TextDecoder("utf-8").decode(bytes.subarray(q, q + len)));
            }
          } else {
            if (p + 2 > bytes.length) continue;
            let len = dv.getUint16(p, true);
            let q = p + 2;
            if (len & 0x8000) {
              len = ((len & 0x7fff) << 16) | dv.getUint16(q, true);
              q += 2;
            }
            if (q + len * 2 <= bytes.length) {
              out.push(
                new TextDecoder("utf-16le").decode(bytes.subarray(q, q + len * 2))
              );
            }
          }
        }
      } catch {
        /* malformed pool — stop parsing */
        break;
      }
    }
    off += chunkSize;
  }
  return out;
}

export function apkProvider(bytes: Uint8Array, name: string): Provider {
  let zipped: Record<string, Uint8Array> | null = null;
  const STRINGS_CACHE: { strings: string[]; ok: boolean } = { strings: [], ok: false };
  const derive = (): Record<string, string> => {
    if (!zipped) return {};
    const man = zipped["AndroidManifest.xml"];
    if (man && !STRINGS_CACHE.ok) {
      STRINGS_CACHE.strings = parseBinaryXmlStrings(man);
      STRINGS_CACHE.ok = true;
    }
    const s = STRINGS_CACHE.strings;
    const pkg = s.find((x) => /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]{2,}){1,4}$/.test(x) && !/^(http|https|android|apk|com\.android)$/.test(x));
    const perms = [...new Set(s.filter((x) => x.startsWith("android.permission.")))];
    const abis = new Set<string>();
    let libs = 0;
    const dexFiles: string[] = [];
    for (const p of Object.keys(zipped)) {
      if (p.startsWith("lib/")) {
        const abi = p.split("/")[1];
        if (abi) abis.add(abi);
        libs++;
      }
      if (p.endsWith(".dex")) dexFiles.push(p);
    }
    const version = s.find((x) => /^\d+\.\d+(\.\d+)?$/.test(x));
    const meta: Record<string, string> = {
      "File name": name,
      "Package (heuristic)": pkg ?? "not reliably extractable",
      "Version candidate": version ?? "—",
      Permissions: perms.length ? perms.slice(0, 8).join(", ") + (perms.length > 8 ? ` +${perms.length - 8} more` : "") : "none found",
      "Native ABIs": [...abis].join(", ") || "none",
      "Native libraries": String(libs),
      "DEX files": dexFiles.join(", ") || "none found",
      "Total files": String(Object.keys(zipped).length),
    };
    return meta;
  };
  const metaText = (): string => {
    const m = derive();
    const perms = m.Permissions === "none found" ? [] : m.Permissions.split(", ");
    const lines: string[] = [
      "# APK static metadata (heuristic)",
      "",
      "This is a static, non-invasive inspection of the archive structure and",
      "string pool. No bytecode is executed and no protections are bypassed.",
      "",
      "| Field | Value |",
      "| --- | --- |",
    ];
    for (const [k, v] of Object.entries(m)) lines.push(`| ${k} | ${v.replace(/\|/g, "\\|")} |`);
    lines.push(
      "",
      "## Declared permissions",
      perms.length ? perms.map((p) => `- \`${p}\``).join("\n") : "- none found",
      "",
      "## Notes",
      "- Package/version extraction from binary XML is heuristic; treat as a hint, not a fact.",
      "- Native libraries are listed, not reversed.",
    );
    return lines.join("\n");
  };
  return {
    kind: "apk",
    name,
    label: "Android APK (static)",
    notes: [
      "APK inspected statically (ZIP structure + AndroidManifest string pool).",
      "No execution, no decompilation of protected code, no protection bypass.",
    ],
    get meta() {
      return derive();
    },
    load(onStep) {
      onStep?.("Extracting APK…");
      return new Promise((resolve) => {
        setTimeout(() => {
          zipped = unzipSync(bytes);
          const files: FileEntry[] = [
            { path: "[apk-metadata].md", isDir: false, size: 0 },
            ...Object.keys(zipped)
              .filter((p) => !p.endsWith("/"))
              .map((p) => ({ path: p, isDir: false, size: zipped![p].length })),
          ];
          resolve(files);
        }, 10);
      });
    },
    readText: memoRead(async (path: string) => {
      if (path === "[apk-metadata].md") return metaText();
      const b = zipped?.[path];
      if (!b) return null;
      return bytesToText(b);
    }),
  };
}

// ---------------------------------------------------------------------------
// EXE: Portable Executable header parsing (metadata only)
// ---------------------------------------------------------------------------

export interface PeMeta {
  machine: string;
  machineHex: string;
  timestamp: string;
  subsystem: string;
  characteristics: string[];
  sections: Array<{ name: string; size: number; flags: string[] }>;
  isDotNet: boolean;
  isUPX: boolean;
  entryPoint: string;
  imageBase: string;
  detectedMarkers: string[];
  fileSize: number;
}

const MACHINES: Record<number, string> = {
  0x014c: "x86 (32-bit)",
  0x8664: "x64 (64-bit)",
  0xaa64: "ARM64",
  0x01c4: "ARMv7 (32-bit)",
  0x01a2: "ARMv6",
  0x5032: "RISC-V 32-bit",
  0x5064: "RISC-V 64-bit",
  0x5128: "RISC-V 128-bit",
  0x0200: "Itanium",
  0x01f0: "PowerPC",
  0x01c0: "ARM Thumb",
};

const SUBSYSTEMS: Record<number, string> = {
  1: "Native",
  2: "Windows GUI",
  3: "Windows Console",
  7: "POSIX",
  9: "Windows CE",
  10: "EFI",
};

const SECTION_FLAGS: Array<[number, string]> = [
  [0x00000020, "CODE"],
  [0x40000000, "READ"],
  [0x80000000, "WRITE"],
  [0x20000000, "EXECUTE"],
  [0x00000080, "INITIALIZED_DATA"],
  [0x00000040, "UNINITIALIZED_DATA"],
];

export function parsePe(bytes: Uint8Array): PeMeta {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const meta: PeMeta = {
    machine: "unknown",
    machineHex: "",
    timestamp: "unknown",
    subsystem: "unknown",
    characteristics: [],
    sections: [],
    isDotNet: false,
    isUPX: false,
    entryPoint: "",
    imageBase: "",
    detectedMarkers: [],
    fileSize: bytes.length,
  };
  if (bytes.length < 0x40 || bytes[0] !== 0x4d || bytes[1] !== 0x5a) {
    meta.detectedMarkers.push("Not a PE file (missing MZ header)");
    return meta;
  }
  let peOff = dv.getUint32(0x3c, true);
  if (peOff + 24 > bytes.length || bytes[peOff] !== 0x50 || bytes[peOff + 1] !== 0x45) {
    meta.detectedMarkers.push("PE signature not found");
    return meta;
  }
  try {
    const machine = dv.getUint16(peOff + 4, true);
    const numSections = dv.getUint16(peOff + 6, true);
    const timestamp = dv.getUint32(peOff + 8, true);
    const sizeOfOpt = dv.getUint16(peOff + 20, true);
    const opt = peOff + 24;
    const magic = dv.getUint16(opt, true);
    const isPe32Plus = magic === 0x20b;
    meta.machine = MACHINES[machine] ?? `0x${machine.toString(16).toUpperCase()}`;
    meta.machineHex = `0x${machine.toString(16).toUpperCase()}`;
    meta.timestamp = timestamp
      ? new Date(timestamp * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC"
      : "unknown";
    meta.subsystem = SUBSYSTEMS[dv.getUint16(opt + 68, true)] ?? "unknown";
    const imageBase = isPe32Plus ? dv.getBigUint64(opt + 24, true) : BigInt(dv.getUint32(opt + 28, true));
    meta.imageBase = `0x${imageBase.toString(16).toUpperCase()}`;
    const entry = isPe32Plus ? dv.getUint32(opt + 16, true) : dv.getUint32(opt + 16, true);
    meta.entryPoint = `0x${entry.toString(16).toUpperCase()}`;
    // CLI (managed .NET) data directory index 14.
    // Data directories start at opt+96 for PE32, but at opt+112 for PE32+
    // (8-byte ImageBase shifts everything after BaseOfCode).
    const dd = opt + (isPe32Plus ? 112 : 96);
    if (dd + 15 * 8 + 8 <= bytes.length) {
      const cliRva = dv.getUint32(dd + 14 * 8, true);
      const cliSize = dv.getUint32(dd + 14 * 8 + 4, true);
      meta.isDotNet = cliRva !== 0 && cliSize > 0;
    }
    const secTab = opt + sizeOfOpt;
    for (let i = 0; i < numSections && i < 96; i++) {
      const base = secTab + i * 40;
      if (base + 40 > bytes.length) break;
      const name = new TextDecoder("ascii")
        .decode(bytes.subarray(base, base + 8))
        .replace(/\0+$/, "")
        .trim();
      const rawSize = dv.getUint32(base + 16, true);
      const chars = dv.getUint32(base + 36, true);
      const flags = SECTION_FLAGS.filter(([f]) => (chars & f) === f).map(([, l]) => l);
      meta.sections.push({ name: name || `section${i}`, size: rawSize, flags });
      if (name.toUpperCase().startsWith("UPX")) meta.isUPX = true;
    }
  } catch {
    meta.detectedMarkers.push("Partial header parse (truncated file)");
  }
  // Lightweight marker scan over the first 2 MB
  const scan = bytes.subarray(0, Math.min(bytes.length, 2 * 1024 * 1024));
  const hay = new TextDecoder("latin1", { fatal: false }).decode(scan);
  const markers: Array<[RegExp, string]> = [
    [/Go build ID/i, "Go (golang)"],
    [/rust_eh_personality|__rust_alloc/i, "Rust"],
    [/Electron/i, "Electron"],
    [/node_modules[\\/]/i, "Node.js/Electron"],
    [/mscoree\.dll/i, ".NET runtime"],
    [/Nuitka/i, "Python (Nuitka)"],
    [/PyInstaller|python3?\.dll/i, "Python (PyInstaller)"],
    [/libcef\.dll/i, "Chromium Embedded (CEF)"],
    [/Qt5?Core\.dll|Qt[0-9]\.dll/i, "Qt"],
    [/UPX!/i, "UPX-packed"],
    [/\.NET Framework/i, ".NET Framework"],
  ];
  for (const [re, label] of markers) {
    if (re.test(hay) && !meta.detectedMarkers.includes(label)) meta.detectedMarkers.push(label);
  }
  return meta;
}

function peMetaText(meta: PeMeta): string {
  const lines = [
    "# Windows executable — static metadata",
    "",
    "Non-invasive PE header inspection. No code is executed and no protections",
    "are bypassed.",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| File size | ${meta.fileSize.toLocaleString()} bytes |`,
    `| Architecture | ${meta.machine} (${meta.machineHex}) |`,
    `| Subsystem | ${meta.subsystem} |`,
    `| Link timestamp | ${meta.timestamp} |`,
    `| Entry point (RVA) | ${meta.entryPoint} |`,
    `| Image base | ${meta.imageBase} |`,
    `| Managed (.NET) | ${meta.isDotNet ? "yes" : "no"} |`,
    `| UPX packed (heuristic) | ${meta.isUPX ? "yes" : "no"} |`,
    "",
    "## Sections",
    "",
    ...meta.sections.map((s) => `- \`${s.name}\` — ${s.size.toLocaleString()} bytes — ${s.flags.join(", ") || "no flags"}`),
    "",
    "## Heuristic runtime markers",
    meta.detectedMarkers.length
      ? meta.detectedMarkers.map((m) => `- ${m}`).join("\n")
      : "- none detected in the first 2 MB of file data",
    "",
    "## Notes",
    "- The link timestamp is stored by the compiler and is not a reliable build date.",
    "- Detected runtimes are string-marker heuristics, not guarantees.",
  ];
  return lines.join("\n");
}

export function exeProvider(bytes: Uint8Array, name: string): Provider {
  let meta: PeMeta | null = null;
  return {
    kind: "exe",
    name,
    label: "Windows executable (static)",
    notes: ["EXE inspected statically (PE headers only). No code execution."],
    get meta() {
      if (!meta) meta = parsePe(bytes);
      const m = meta;
      return {
        Architecture: m.machine,
        Subsystem: m.subsystem,
        "Link timestamp": m.timestamp,
        "Managed (.NET)": m.isDotNet ? "yes" : "no",
        "UPX packed": m.isUPX ? "yes (heuristic)" : "no",
        "File size": `${m.fileSize.toLocaleString()} bytes`,
        "Runtime markers": m.detectedMarkers.join(", ") || "none",
      };
    },
    async load() {
      if (!meta) meta = parsePe(bytes);
      return [{ path: "[pe-metadata].md", isDir: false, size: bytes.length }];
    },
    readText: memoRead(async (path: string) => {
      if (path === "[pe-metadata].md") {
        if (!meta) meta = parsePe(bytes);
        return peMetaText(meta);
      }
      return null;
    }),
  };
}

// ---------------------------------------------------------------------------
// Dispatch helper for drag & drop
// ---------------------------------------------------------------------------

export async function providerFromDrop(item: DataTransferItem): Promise<Provider | null> {
  if (item.kind !== "file") return null;
  const entry = (item as any).webkitGetAsEntry?.();
  if (entry && entry.isDirectory) {
    try {
      const handle = await (item as any).getAsFileSystemHandle?.();
      if (handle && handle.kind === "directory") return browserFolderProvider(handle);
    } catch {
      /* fall through */
    }
    return null;
  }
  const file = item.getAsFile();
  if (!file) return null;
  return providerFromFile(file);
}

export async function providerFromFile(file: File): Promise<Provider> {
  const name = file.name;
  const lower = name.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (lower.endsWith(".zip")) return zipProvider(bytes, name, "zip");
  if (lower.endsWith(".apk") || lower.endsWith(".aab")) return apkProvider(bytes, name);
  if (lower.endsWith(".exe") || lower.endsWith(".dll") || lower.endsWith(".msi")) {
    return exeProvider(bytes, name);
  }
  throw new Error("Unsupported file type. Drop a folder, .zip, .apk, or .exe.");
}

export async function pickFolderBrowser(): Promise<Provider | null> {
  const w = window as any;
  if (typeof w.showDirectoryPicker === "function") {
    try {
      const handle = await w.showDirectoryPicker();
      return browserFolderProvider(handle);
    } catch {
      return null; // user cancelled
    }
  }
  return null;
}

export function isTextLikeFile(name: string): boolean {
  return isTextPath(name);
}

export { strFromU8 };
