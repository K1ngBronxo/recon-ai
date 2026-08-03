// Dependency manifest parsing. Entirely local — no online version checks in
// the MVP. Reports runtime/dev split, duplicates across manifests, unpinned
// versions and heavy manifests.
import type { Dependency, DepSummary, ManifestDep } from "../types";

type Reader = (path: string) => Promise<string | null>;

function cleanVersion(v: string): string {
  return v.trim().replace(/^["']|["']$/g, "").replace(/,?\s*$/, "");
}

function toDeps(
  manifest: string,
  entries: Array<[string, string, "runtime" | "dev"]>
): Dependency[] {
  return entries
    .filter(([n]) => n && !n.startsWith("_"))
    .map(([name, version, kind]) => ({
      name,
      version: version || "*",
      kind,
      manifest,
      pinned:
        version !== "" &&
        version !== "*" &&
        version !== "latest" &&
        /^v?\d+\.\d+/.test(version) &&
        !/^(>=|<=|~=|~|\^)/.test(version),
    }));
}

function parsePackageJson(manifest: string, text: string): Dependency[] {
  try {
    const j = JSON.parse(text);
    const deps = Object.entries(j.dependencies ?? {}) as Array<[string, string]>;
    const dev = Object.entries(j.devDependencies ?? {}) as Array<[string, string]>;
    return toDeps(manifest, [
      ...deps.map(([n, v]): [string, string, "runtime" | "dev"] => [n, v, "runtime"]),
      ...dev.map(([n, v]): [string, string, "runtime" | "dev"] => [n, v, "dev"]),
    ]);
  } catch {
    return [{ name: "(parse error)", version: "", kind: "unknown", manifest, pinned: false }];
  }
}

function parseRequirements(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = /^([A-Za-z0-9_.\-]+)\s*(==|>=|<=|~=|!=|>|<)?\s*([^\s;]+)?/.exec(line);
    if (m && !line.startsWith("-") && !line.startsWith("--")) {
      const [, name, op, version] = m;
      deps.push({
        name,
        version: version ? `${op ?? ""}${version}` : "*",
        kind: "runtime",
        manifest,
        pinned: op === "==",
      });
    }
  }
  return deps;
}

function parseCargoToml(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  let kind: "runtime" | "dev" = "runtime";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const sec = /^\[(dependencies|dev-dependencies|build-dependencies)\]/.exec(line);
    if (sec) {
      kind = sec[1] === "dev-dependencies" ? "dev" : "runtime";
      continue;
    }
    if (line.startsWith("[") || line.startsWith("#") || !line) continue;
    const m = /^([A-Za-z0-9_-]+)\s*=\s*(?:\{?\s*version\s*=\s*)?["']([^"']*)["']/.exec(line);
    if (m) {
      deps.push({ name: m[1], version: cleanVersion(m[2]) || "*", kind, manifest, pinned: m[2] !== "" && !m[2].startsWith("^") && !m[2].startsWith("~") });
    }
  }
  return deps;
}

function parseGoMod(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  let inRequire = false;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (/^require\s*\(/.test(line)) {
      inRequire = true;
      continue;
    }
    if (inRequire && line === ")") {
      inRequire = false;
      continue;
    }
    if (inRequire) {
      const m = /^([^\s]+)\s+(v[^\s]+)/.exec(line);
      if (m) deps.push({ name: m[1], version: m[2], kind: "runtime", manifest, pinned: true });
    } else if (/^require\s+([^\s]+)\s+(v[^\s]+)/.test(line)) {
      const m = /^require\s+([^\s]+)\s+(v[^\s]+)/.exec(line);
      if (m) deps.push({ name: m[1], version: m[2], kind: "runtime", manifest, pinned: true });
    }
  }
  return deps;
}

function parsePomXml(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  const blocks = text.match(/<dependency>[\s\S]*?<\/dependency>/g) ?? [];
  for (const b of blocks) {
    const g = /<groupId>([^<]+)<\/groupId>/.exec(b)?.[1]?.trim() ?? "";
    const a = /<artifactId>([^<]+)<\/artifactId>/.exec(b)?.[1]?.trim() ?? "";
    const v = /<version>([^<]+)<\/version>/.exec(b)?.[1]?.trim() ?? "";
    const scope = /<scope>([^<]+)<\/scope>/.exec(b)?.[1]?.trim() ?? "";
    if (a) {
      deps.push({
        name: g ? `${g}:${a}` : a,
        version: v || "*",
        kind: scope === "test" ? "dev" : "runtime",
        manifest,
        pinned: Boolean(v),
      });
    }
  }
  return deps;
}

function parseGradle(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  const re = /(?:implementation|api|compileOnly|testImplementation|runtimeOnly|classpath)\s*(?:\(\s*)?["']([^"']+):([^"']+):([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    deps.push({
      name: `${m[1]}:${m[2]}`,
      version: m[3],
      kind: /^test|classpath/.test(m[0]) ? "dev" : "runtime",
      manifest,
      pinned: true,
    });
  }
  return deps;
}

function parseYamlDeps(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  let kind: "runtime" | "dev" = "runtime";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (/^dependencies:/i.test(line)) kind = "runtime";
    else if (/^dev[_ -]?dependencies:/i.test(line)) kind = "dev";
    const m = /^([A-Za-z0-9_.\-/@]+):\s*(.*)$/.exec(line);
    if (m && m[1].length > 1 && !m[1].startsWith("sdk") && line.startsWith("  ")) {
      const name = m[1];
      const version = m[2].replace(/[`'"]/g, "").trim();
      if (version && version !== "any" && name !== "sdk") {
        deps.push({ name, version, kind, manifest, pinned: !version.startsWith("^") && !version.startsWith("~") });
      }
    }
  }
  return deps;
}

function parseComposer(manifest: string, text: string): Dependency[] {
  try {
    const j = JSON.parse(text);
    const req = Object.entries(j.require ?? {}) as Array<[string, string]>;
    const dev = Object.entries(j["require-dev"] ?? {}) as Array<[string, string]>;
    return toDeps(manifest, [
      ...req.map(([n, v]): [string, string, "runtime" | "dev"] => [n, v, "runtime"]),
      ...dev.map(([n, v]): [string, string, "runtime" | "dev"] => [n, v, "dev"]),
    ]).filter((d) => d.name !== "php");
  } catch {
    return [];
  }
}

function parseCsproj(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  const re = /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]*)"\s*\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    deps.push({ name: m[1], version: m[2] || "*", kind: "runtime", manifest, pinned: Boolean(m[2]) });
  }
  return deps;
}

function parseGemfile(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  const re = /gem\s+["']([^"']+)["']\s*(?:,\s*["']([^"']+)["'])?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    deps.push({ name: m[1], version: m[2] ?? "*", kind: "runtime", manifest, pinned: Boolean(m[2]) });
  }
  return deps;
}

function manifestKind(manifest: string): string {
  const b = manifest.split("/").pop() ?? manifest;
  if (b === "package.json") return "npm";
  if (b === "requirements.txt" || b === "requirements.in") return "pip";
  if (b === "Cargo.toml") return "cargo";
  if (b === "go.mod") return "go modules";
  if (b === "pom.xml") return "maven";
  if (b === "build.gradle" || b === "build.gradle.kts") return "gradle";
  if (b === "composer.json") return "composer";
  if (b === "pubspec.yaml") return "pub";
  if (b === "pyproject.toml") return "poetry/pyproject";
  if (b === "Pipfile") return "pipenv";
  if (b?.endsWith(".csproj")) return "nuget";
  if (b === "Gemfile") return "bundler";
  return b;
}

const MANIFEST_NAMES = [
  "package.json",
  "requirements.txt",
  "requirements.in",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "composer.json",
  "pubspec.yaml",
  "pyproject.toml",
  "Pipfile",
  "Gemfile",
];

export async function parseDependencies(
  reader: Reader,
  files: Array<{ path: string; isDir: boolean }>
): Promise<{ deps: Dependency[]; manifests: string[]; summary: DepSummary }> {
  const manifests: string[] = [];
  for (const name of MANIFEST_NAMES) {
    const hit = files.find((f) => !f.isDir && f.path.endsWith("/" + name) || (!f.isDir && f.path === name));
    if (hit && !manifests.includes(hit.path)) manifests.push(hit.path);
  }
  // csproj files
  for (const f of files) {
    if (!f.isDir && /\.csproj$/i.test(f.path) && !manifests.includes(f.path)) manifests.push(f.path);
  }

  const all: Dependency[] = [];
  for (const manifest of manifests) {
    const text = await reader(manifest);
    if (!text) continue;
    const b = manifest.split("/").pop() ?? manifest;
    let parsed: Dependency[] = [];
    if (b === "package.json") parsed = parsePackageJson(manifest, text);
    else if (b === "requirements.txt" || b === "requirements.in") parsed = parseRequirements(manifest, text);
    else if (b === "Cargo.toml") parsed = parseCargoToml(manifest, text);
    else if (b === "go.mod") parsed = parseGoMod(manifest, text);
    else if (b === "pom.xml") parsed = parsePomXml(manifest, text);
    else if (b === "build.gradle" || b === "build.gradle.kts") parsed = parseGradle(manifest, text);
    else if (b === "composer.json") parsed = parseComposer(manifest, text);
    else if (b === "pubspec.yaml") parsed = parseYamlDeps(manifest, text);
    else if (b === "Pipfile") parsed = parsePipfile(manifest, text);
    else if (b === "pyproject.toml") parsed = parsePyproject(manifest, text);
    else if (b === "Gemfile") parsed = parseGemfile(manifest, text);
    else if (b?.endsWith(".csproj")) parsed = parseCsproj(manifest, text);
    all.push(...parsed);
  }

  // Summaries
  const byManifest: ManifestDep[] = [];
  const map = new Map<string, { runtime: number; dev: number; kind: string; parseError?: string }>();
  for (const m of manifests) {
    map.set(m, { runtime: 0, dev: 0, kind: manifestKind(m) });
  }
  for (const d of all) {
    const s = map.get(d.manifest);
    if (s) {
      if (d.kind === "dev") s.dev++;
      else s.runtime++;
      if (d.name === "(parse error)") s.parseError = "unparseable manifest";
    }
  }
  for (const [manifest, s] of map.entries()) {
    byManifest.push({ manifest, kind: s.kind, runtime: s.runtime, dev: s.dev, total: s.runtime + s.dev, parseError: s.parseError });
  }

  const duplicates: string[] = [];
  const perName = new Map<string, Set<string>>();
  for (const d of all) {
    if (!perName.has(d.name)) perName.set(d.name, new Set());
    perName.get(d.name)!.add(d.manifest);
  }
  for (const [name, set] of perName.entries()) {
    if (set.size > 1 && name !== "(parse error)") duplicates.push(name);
  }

  const unpinned = all.filter((d) => !d.pinned && d.version && d.version !== "*" && d.version !== "latest").map((d) => d.name);
  const heavyManifests = byManifest.filter((m) => m.total >= 40 && !m.parseError).map((m) => `${m.manifest} (${m.total})`);

  return {
    deps: all.filter((d) => d.name !== "(parse error)"),
    manifests,
    summary: {
      runtime: all.filter((d) => d.kind === "runtime").length,
      dev: all.filter((d) => d.kind === "dev").length,
      unpinned: [...new Set(unpinned)].slice(0, 20),
      duplicates: duplicates.slice(0, 20),
      heavyManifests: heavyManifests.slice(0, 10),
      byManifest,
    },
  };
}

function parsePyproject(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  // Track dev/runtime per section instead of one boolean for the whole file.
  const sections = text.split(/^(?=\[)/m);
  const stripName = (s: string) => s.replace(/^["']|["']$/g, "").split(/\[|;|,|\s/)[0];
  for (const sec of sections) {
    const header = (/^\[([^\]]+)\]/.exec(sec)?.[1] ?? "").toLowerCase();
    if (!header) continue;
    const keyRe = /^\s*([A-Za-z0-9_-]+)\s*=\s*\[([\s\S]*?)\]\s*$/gm;
    let km: RegExpExecArray | null;
    while ((km = keyRe.exec(sec))) {
      const key = km[1].toLowerCase();
      const isDepsList =
        header.includes("dependency-groups") || key.includes("dependenc");
      if (!isDepsList) continue;
      const isDev = header.includes("dev") || key.includes("dev");
      const re = /["']([A-Za-z0-9_.\-\[\]]+)([=<>~!^].*?)["']/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(km[2]))) {
        deps.push({
          name: stripName(m[1]),
          version: m[2]?.trim() || "*",
          kind: isDev ? "dev" : "runtime",
          manifest,
          pinned: m[2]?.startsWith("==") ?? false,
        });
      }
    }
  }
  return deps;
}

function parsePipfile(manifest: string, text: string): Dependency[] {
  const deps: Dependency[] = [];
  let kind: "runtime" | "dev" = "runtime";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("[packages]")) kind = "runtime";
    else if (line.startsWith("[dev-packages]")) kind = "dev";
    else {
      const m = /^([A-Za-z0-9_.\-]+)\s*=\s*["']?([^"'\s]+)?/.exec(line);
      if (m && m[1] !== "python_version" && m[1] !== "python_full_version" && m[1] !== "requires") {
        const version = (m[2] ?? "").replace(/^["']|["']$/g, "");
        if (version) {
          deps.push({
            name: m[1],
            version,
            kind,
            manifest,
            pinned: /^\d/.test(version) && !version.startsWith("*"),
          });
        }
      }
    }
  }
  return deps;
}
