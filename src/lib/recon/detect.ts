// Local heuristics: language, framework, entry point, build system and
// config file detection. Everything here runs on-device so only concise
// summaries ever reach the AI.
import type { FileEntry, FrameworkInfo, LangInfo } from "../types";

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

const LANG_MAP: Record<string, [string, string]> = {
  ".ts": ["TypeScript", "#3178C6"],
  ".tsx": ["TypeScript (React)", "#3178C6"],
  ".mts": ["TypeScript", "#3178C6"],
  ".js": ["JavaScript", "#F7DF1E"],
  ".jsx": ["JavaScript (React)", "#F7DF1E"],
  ".mjs": ["JavaScript", "#F7DF1E"],
  ".cjs": ["JavaScript", "#F7DF1E"],
  ".py": ["Python", "#3776AB"],
  ".pyi": ["Python", "#3776AB"],
  ".java": ["Java", "#E76F00"],
  ".kt": ["Kotlin", "#7F52FF"],
  ".kts": ["Kotlin", "#7F52FF"],
  ".swift": ["Swift", "#F05138"],
  ".dart": ["Dart", "#0175C2"],
  ".go": ["Go", "#00ADD8"],
  ".rs": ["Rust", "#DEA584"],
  ".php": ["PHP", "#777BB4"],
  ".cs": ["C#", "#68217A"],
  ".c": ["C", "#8C8C8C"],
  ".h": ["C/C++ Header", "#8C8C8C"],
  ".cpp": ["C++", "#00599C"],
  ".cc": ["C++", "#00599C"],
  ".cxx": ["C++", "#00599C"],
  ".hpp": ["C++ Header", "#00599C"],
  ".html": ["HTML", "#E34F26"],
  ".htm": ["HTML", "#E34F26"],
  ".css": ["CSS", "#663399"],
  ".scss": ["SCSS", "#CC6699"],
  ".sass": ["Sass", "#CC6699"],
  ".less": ["Less", "#1D365D"],
  ".vue": ["Vue", "#42B883"],
  ".svelte": ["Svelte", "#FF3E00"],
  ".rb": ["Ruby", "#CC342D"],
  ".sh": ["Shell", "#4EAA25"],
  ".bash": ["Shell", "#4EAA25"],
  ".zsh": ["Shell", "#4EAA25"],
  ".ps1": ["PowerShell", "#012456"],
  ".bat": ["Batch", "#4EAA25"],
  ".cmd": ["Batch", "#4EAA25"],
  ".sql": ["SQL", "#E38C00"],
  ".md": ["Markdown", "#083FA1"],
  ".json": ["JSON", "#9C9C9C"],
  ".yaml": ["YAML", "#CB171E"],
  ".yml": ["YAML", "#CB171E"],
  ".toml": ["TOML", "#9C4221"],
  ".xml": ["XML", "#0060AC"],
  ".svg": ["SVG", "#FFB13B"],
  ".gradle": ["Gradle", "#02303A"],
  ".proto": ["Protocol Buffers", "#FFD03F"],
  ".lua": ["Lua", "#5E5E5E"],
  ".pl": ["Perl", "#39457E"],
  ".r": ["R", "#276DC3"],
  ".jl": ["Julia", "#9558B2"],
  ".scala": ["Scala", "#DC322F"],
  ".ex": ["Elixir", "#4E2AAD"],
  ".exs": ["Elixir", "#4E2AAD"],
  ".hs": ["Haskell", "#5E5086"],
  ".clj": ["Clojure", "#5881D8"],
  ".zig": ["Zig", "#EC915C"],
  ".nim": ["Nim", "#FFC200"],
  ".sol": ["Solidity", "#363636"],
  ".tf": ["Terraform", "#7B42BC"],
};

export function detectLanguages(files: FileEntry[]): LangInfo[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const f of files) {
    if (f.isDir) continue;
    const base = f.path.split("/").pop() ?? "";
    const dot = base.lastIndexOf(".");
    if (dot <= 0) continue;
    const ext = base.slice(dot).toLowerCase();
    const hit = LANG_MAP[ext];
    if (!hit) continue;
    counts.set(hit[0], (counts.get(hit[0]) ?? 0) + 1);
    total++;
  }
  const out: LangInfo[] = [...counts.entries()]
    .map(([name, files]) => {
      const color = LANG_MAP[Object.keys(LANG_MAP).find((k) => LANG_MAP[k][0] === name) ?? ""]?.[1] ?? "#888";
      const confidence = name === "C/C++ Header" ? 0.7 : 0.96;
      return { name, files, confidence, color };
    })
    .sort((a, b) => b.files - a.files);
  return out.map((l) => ({ ...l, confidence: total ? Math.round((l.confidence - (total > 200 ? 0.03 : 0)) * 100) / 100 : l.confidence }));
}

// ---------------------------------------------------------------------------
// Framework / runtime detection
// ---------------------------------------------------------------------------

type Reader = (path: string) => Promise<string | null>;

const PKG_FW: Array<[string[], string, number]> = [
  [["next"], "Next.js", 1],
  [["nuxt", "nuxt3"], "Nuxt", 1],
  [["@angular/core"], "Angular", 1],
  [["react", "react-dom", "preact"], "React", 0.9],
  [["vue"], "Vue", 0.95],
  [["svelte", "@sveltejs/kit"], "Svelte / SvelteKit", 0.95],
  [["express"], "Express", 1],
  [["fastify"], "Fastify", 1],
  [["@nestjs/core"], "NestJS", 1],
  [["hapi", "@hapi/hapi"], "Hapi", 0.9],
  [["koa"], "Koa", 0.9],
  [["electron"], "Electron", 1],
  [["tauri", "@tauri-apps/api", "@tauri-apps/cli"], "Tauri", 1],
  [["react-native"], "React Native", 1],
  [["expo"], "Expo", 1],
  [["gatsby"], "Gatsby", 1],
  [["remix", "@remix-run/react"], "Remix", 1],
  [["astro"], "Astro", 1],
  [["socket.io", "socket.io-client"], "Socket.IO", 0.8],
  [["@apollo/client", "apollo-server"], "GraphQL / Apollo", 0.8],
  [["prisma", "@prisma/client"], "Prisma ORM", 0.9],
  [["sequelize", "sequelize-typescript"], "Sequelize ORM", 0.9],
  [["mongoose"], "Mongoose (MongoDB)", 0.9],
  [["typeorm"], "TypeORM", 0.9],
  [["mobx", "mobx-react"], "MobX", 0.9],
  [["redux", "react-redux"], "Redux", 0.85],
  [["zustand"], "Zustand", 0.9],
  [["rxjs"], "RxJS", 0.8],
];

const PY_FW: Array<[string[], string, number]> = [
  [["django"], "Django", 1],
  [["flask"], "Flask", 1],
  [["fastapi"], "FastAPI", 1],
  [["starlette"], "Starlette", 0.9],
  [["tornado"], "Tornado", 0.9],
  [["aiohttp"], "aiohttp", 0.9],
  [["sqlalchemy"], "SQLAlchemy", 0.85],
  [["pydantic"], "Pydantic", 0.8],
  [["celery"], "Celery", 0.9],
  [["scrapy"], "Scrapy", 0.95],
  [["pandas"], "Pandas", 0.8],
  [["numpy"], "NumPy", 0.8],
  [["torch"], "PyTorch", 0.9],
  [["tensorflow"], "TensorFlow", 0.9],
];

const RS_FW: Array<[string[], string, number]> = [
  [["tauri"], "Tauri", 1],
  [["axum"], "Axum", 1],
  [["actix-web"], "Actix Web", 1],
  [["rocket"], "Rocket", 1],
  [["warp"], "Warp", 0.9],
  [["tokio"], "Tokio (async runtime)", 0.8],
  [["serde"], "Serde (serialization)", 0.8],
  [["egui"], "egui (GUI)", 0.95],
  [["iced"], "Iced (GUI)", 0.95],
  [["bevy"], "Bevy (game engine)", 0.95],
  [["clap"], "Clap (CLI)", 0.85],
  [["ratatui"], "Ratatui (TUI)", 0.95],
];

const GO_FW: Array<[string[], string, number]> = [
  [["gin-gonic"], "Gin", 1],
  [["labstack/echo"], "Echo", 1],
  [["gofiber"], "Fiber", 1],
  [["gorilla/mux"], "Gorilla Mux", 1],
  [["chi"], "Chi", 0.9],
  [["urfave/cli"], "Cobra/CLI", 0.85],
  [["spf13/cobra"], "Cobra (CLI)", 0.95],
];

const JVM_FW: Array<[string, string, number]> = [
  ["spring-boot", "Spring Boot", 1],
  ["spring-web", "Spring Web", 0.9],
  ["retrofit", "Retrofit", 1],
  ["okhttp", "OkHttp", 0.9],
  ["ktor", "Ktor", 1],
  ["junit", "JUnit", 0.7],
  ["androidx.appcompat", "AndroidX (Android app)", 0.9],
];

const COMPOSER_FW: Array<[string, string, number]> = [
  ["laravel/framework", "Laravel", 1],
  ["symfony/framework-bundle", "Symfony", 1],
  ["codeigniter/framework", "CodeIgniter", 1],
  ["slim/slim", "Slim", 0.95],
  ["yiisoft/yii2", "Yii2", 1],
];

const RUNTIME_BY_BASE: Array<[RegExp, string]> = [
  [/node[:@ ]?\S*/i, "Node.js runtime"],
  [/python[:@ ]?\S*/i, "Python runtime"],
  [/openjdk|eclipse-temurin|amazoncorretto|adoptopenjdk/i, "Java runtime"],
  [/golang/i, "Go runtime"],
  [/rust|rustlang/i, "Rust runtime"],
  [/ruby/i, "Ruby runtime"],
  [/php/i, "PHP runtime"],
  [/dotnet|aspnet|mcr\.microsoft\.com\/dotnet/i, ".NET runtime"],
  [/nginx/i, "Nginx server"],
  [/node/i, "Node.js runtime"],
];

function findManifest(files: FileEntry[], name: string): string | undefined {
  return files.find((f) => !f.isDir && f.path.toLowerCase().endsWith(name.toLowerCase()))?.path;
}

export async function detectFrameworks(reader: Reader, files: FileEntry[]): Promise<FrameworkInfo[]> {
  const out: FrameworkInfo[] = [];
  const push = (name: string, confidence: number, source: string, role: FrameworkInfo["role"]) => {
    out.push({ name, confidence, source, role });
  };

  // package.json
  const pkgPath = findManifest(files, "package.json");
  if (pkgPath) {
    const text = await reader(pkgPath);
    if (text) {
      try {
        const j = JSON.parse(text);
        const all: string[] = [
          ...Object.keys(j.dependencies ?? {}),
          ...Object.keys(j.devDependencies ?? {}),
        ];
        for (const [needles, name, conf] of PKG_FW) {
          const hit = needles.find((n) => all.includes(n));
          if (hit) push(name, conf, pkgPath, name.includes("ORM") || ["Redux", "Zustand", "MobX", "RxJS"].includes(name) ? "library" : "framework");
        }
        if (j.scripts?.start) push("start script defined", 0.9, pkgPath, "build");
        if (j.private === true) push("private project", 0.9, pkgPath, "build");
      } catch {
        push("package.json (unparseable)", 0.9, pkgPath, "build");
      }
    }
  }

  // Python manifests
  const reqPath = findManifest(files, "requirements.txt") ?? findManifest(files, "requirements.in");
  if (reqPath) {
    const text = await reader(reqPath);
    if (text) {
      for (const [needles, name, conf] of PY_FW) {
        if (needles.some((n) => new RegExp(`(^|\\n)${n}[=<>~!]`, "i").test(text))) {
          push(name, conf, reqPath, name === "Pandas" || name === "NumPy" || name === "SQLAlchemy" || name === "Pydantic" ? "library" : "framework");
        }
      }
    }
  }
  const pyprojectPath = findManifest(files, "pyproject.toml");
  if (pyprojectPath) {
    const text = await reader(pyprojectPath);
    if (text) {
      for (const [needles, name, conf] of PY_FW) {
        if (needles.some((n) => new RegExp(`['"]?${n}['"]?`).test(text))) push(name, conf, pyprojectPath, "framework");
      }
    }
  }

  // Rust
  const cargoPath = findManifest(files, "Cargo.toml");
  if (cargoPath) {
    const text = await reader(cargoPath);
    if (text) {
      for (const [needles, name, conf] of RS_FW) {
        if (needles.some((n) => new RegExp(`^${n}\\s*=|"${n}"`, "m").test(text))) push(name, conf, cargoPath, name.includes("(GUI)") || name.includes("game") ? "framework" : "library");
      }
    }
  }

  // Go
  const goPath = findManifest(files, "go.mod");
  if (goPath) {
    const text = await reader(goPath);
    if (text) {
      for (const [needles, name, conf] of GO_FW) {
        if (needles.some((n) => text.includes(n))) push(name, conf, goPath, "framework");
      }
    }
  }

  // JVM
  for (const m of ["pom.xml", "build.gradle", "build.gradle.kts", "build.gradle"]) {
    const p = findManifest(files, m);
    if (p) {
      const text = await reader(p);
      if (text) {
        for (const [needle, name, conf] of JVM_FW) {
          if (text.includes(needle)) push(name, conf, p, name.includes("AndroidX") ? "framework" : "library");
        }
        break;
      }
    }
  }

  // PHP composer
  const composerPath = findManifest(files, "composer.json");
  if (composerPath) {
    const text = await reader(composerPath);
    if (text) {
      try {
        const j = JSON.parse(text);
        const all = { ...j.require, ...(j["require-dev"] ?? {}) };
        for (const [needle, name, conf] of COMPOSER_FW) {
          if (needle in all) push(name, conf, composerPath, "framework");
        }
      } catch {
        /* ignore */
      }
    }
  }

  // Dart / Flutter
  const pubPath = findManifest(files, "pubspec.yaml");
  if (pubPath) {
    const text = await reader(pubPath);
    if (text && /flutter/i.test(text)) push("Flutter", 0.97, pubPath, "framework");
  }

  // .NET
  const csproj = files.find((f) => !f.isDir && f.path.toLowerCase().endsWith(".csproj"));
  if (csproj) {
    const text = await reader(csproj.path);
    if (text) {
      if (/Microsoft\.AspNetCore|Microsoft\.NET\.Sdk\.Web/i.test(text)) push("ASP.NET Core", 0.95, csproj.path, "framework");
      if (/Xamarin|MAUI/i.test(text)) push("MAUI / Xamarin", 0.9, csproj.path, "framework");
    }
  }

  // Apple
  const plist = files.find((f) => !f.isDir && /Info\.plist$/i.test(f.path));
  if (plist) {
    const text = await reader(plist.path);
    if (text) {
      if (/SwiftUI|UIKit/i.test(text)) push("Apple (SwiftUI/UIKit)", 0.9, plist.path, "framework");
      if (/flutter/i.test(text)) push("Flutter (Apple target)", 0.9, plist.path, "framework");
    }
  }

  // Dockerfile runtime
  const dockerPath = findManifest(files, "Dockerfile") ?? files.find((f) => /Dockerfile$/i.test(f.path))?.path;
  if (dockerPath) {
    const text = await reader(dockerPath);
    if (text) {
      for (const line of text.split("\n")) {
        const m = /^\s*FROM\s+([^\s]+)/i.exec(line);
        if (m) {
          const base = m[1];
          const hit = RUNTIME_BY_BASE.find(([re]) => re.test(base));
          if (hit) push(hit[1], 0.9, dockerPath, "runtime");
          break;
        }
      }
    }
  }

  // package.json lockfile signals (build tooling)
  if (files.some((f) => f.path === "pnpm-lock.yaml")) push("pnpm", 1, "pnpm-lock.yaml", "build");
  else if (files.some((f) => f.path === "yarn.lock")) push("yarn", 1, "yarn.lock", "build");
  else if (files.some((f) => f.path === "bun.lockb" || f.path === "bun.lock")) push("bun", 1, "bun.lockb", "build");

  return out.filter((f, i, arr) => arr.findIndex((x) => x.name === f.name) === i);
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

export async function detectEntryPoints(reader: Reader, files: FileEntry[]): Promise<string[]> {
  const out: string[] = [];
  const isFile = (p: string) => files.some((f) => !f.isDir && f.path === p);
  const entries: Array<[string, string]> = [
    ["main.py", "Python entry script"],
    ["app.py", "Python entry script"],
    ["manage.py", "Django management script"],
    ["wsgi.py", "WSGI entry point"],
    ["asgi.py", "ASGI entry point"],
    ["index.js", "JavaScript entry file"],
    ["index.ts", "TypeScript entry file"],
    ["index.jsx", "JavaScript (React) entry file"],
    ["index.tsx", "TypeScript (React) entry file"],
    ["main.js", "JavaScript entry file"],
    ["main.ts", "TypeScript entry file"],
    ["server.js", "Node server entry"],
    ["server.ts", "Node (TS) server entry"],
    ["main.rs", "Rust binary entry"],
    ["lib/main.dart", "Flutter entry"],
    ["main.go", "Go entry file"],
    ["MainActivity.kt", "Android entry activity"],
    ["main.swift", "Swift entry file"],
    ["Program.cs", "C# entry point"],
    ["index.php", "PHP entry file"],
    ["index.html", "HTML entry page"],
  ];
  for (const [p, label] of entries) {
    if (isFile(p)) out.push(`${p} (${label})`);
  }
  for (const pre of ["src/", "lib/", "app/"]) {
    for (const f of ["main.ts", "main.tsx", "main.js", "index.ts", "index.tsx", "index.js"]) {
      const p = pre + f;
      if (isFile(p)) out.push(`${p} (entry file)`);
    }
  }
  const pkgPath = findManifest(files, "package.json");
  if (pkgPath) {
    const text = await reader(pkgPath);
    if (text) {
      try {
        const j = JSON.parse(text);
        if (typeof j.main === "string") out.push(`${j.main} (package.json "main")`);
        if (typeof j.bin === "string") out.push(`${j.bin} (CLI bin)`);
        else if (j.bin && typeof j.bin === "object") {
          for (const v of Object.values(j.bin)) if (typeof v === "string") out.push(`${v} (CLI bin)`);
        }
        const start = j.scripts?.start;
        if (typeof start === "string") out.push(`npm start → ${start}`);
        const dev = j.scripts?.dev;
        if (typeof dev === "string") out.push(`npm run dev → ${dev}`);
      } catch {
        /* ignore */
      }
    }
  }
  return [...new Set(out)].slice(0, 24);
}

// ---------------------------------------------------------------------------
// Build systems & config files
// ---------------------------------------------------------------------------

export function detectBuildSystems(files: FileEntry[]): string[] {
  const out: string[] = [];
  const has = (name: string) => files.some((f) => f.path === name || f.path.endsWith("/" + name));
  const hasExt = (ext: string) => files.some((f) => !f.isDir && f.path.toLowerCase().endsWith(ext));
  if (has("Cargo.toml")) out.push("Cargo (Rust)");
  if (has("pom.xml")) out.push("Maven");
  if (has("build.gradle") || has("build.gradle.kts")) out.push("Gradle");
  if (has("go.mod")) out.push("Go modules");
  if (has("package.json")) {
    if (has("pnpm-lock.yaml")) out.push("pnpm");
    else if (has("yarn.lock")) out.push("yarn");
    else if (has("bun.lockb") || has("bun.lock")) out.push("bun");
    else out.push("npm");
  }
  if (has("requirements.txt") || has("pyproject.toml") || has("Pipfile")) {
    out.push(has("pyproject.toml") ? "Python (pyproject/poetry)" : "Python (pip)");
  }
  if (has("Dockerfile") || hasExt(".dockerfile")) out.push("Docker");
  if (has("docker-compose.yml") || has("docker-compose.yaml")) out.push("Docker Compose");
  if (has("Makefile")) out.push("Make");
  if (has("CMakeLists.txt")) out.push("CMake");
  if (has("composer.json")) out.push("Composer (PHP)");
  if (has("pubspec.yaml")) out.push("Pub (Dart)");
  if (hasExt(".csproj")) out.push("MSBuild / .NET");
  if (has("build.sbt") || has("build.sc")) out.push("sbt / Scala");
  if (has("vite.config.ts") || has("vite.config.js")) out.push("Vite");
  if (has("webpack.config.js") || has("webpack.config.ts")) out.push("Webpack");
  if (has("rollup.config.js") || has("rollup.config.mjs")) out.push("Rollup");
  if (has("tsconfig.json")) out.push("TypeScript");
  if (has("bazel") || has("WORKSPACE") || has("BUILD.bazel")) out.push("Bazel");
  return out.slice(0, 16);
}

export function detectConfigFiles(files: FileEntry[]): string[] {
  const known = [
    "package.json", "tsconfig.json", "tsconfig.node.json", "webpack.config.js", "webpack.config.ts",
    "vite.config.ts", "vite.config.js", "rollup.config.js", "rollup.config.mjs", "next.config.js",
    "next.config.mjs", "nuxt.config.ts", "jest.config.js", "vitest.config.ts", "tailwind.config.js",
    "tailwind.config.ts", "postcss.config.js", ".eslintrc", ".eslintrc.js", ".eslintrc.json",
    "eslint.config.js", "eslint.config.mjs", ".prettierrc", ".prettierrc.json", ".babelrc",
    "babel.config.js", "docker-compose.yml", "docker-compose.yaml", ".env", ".env.example",
    ".env.local", ".env.production", ".gitignore", ".dockerignore", ".npmrc", ".editorconfig",
    "Dockerfile", "Makefile", "CMakeLists.txt", ".python-version", ".nvmrc", ".node-version",
    ".ruby-version", ".tool-versions", ".github/workflows", ".vscode/settings.json", "Cargo.toml",
    "pom.xml", "build.gradle", "build.gradle.kts", "go.mod", "requirements.txt", "pyproject.toml",
    "composer.json", "pubspec.yaml", "Gemfile", ".gitlab-ci.yml", "azure-pipelines.yml",
    "Jenkinsfile", "Procfile", ".pre-commit-config.yaml", "terraform.tfvars",
  ];
  const out: string[] = [];
  for (const name of known) {
    const hit = files.find((f) => f.path === name || f.path.endsWith("/" + name));
    if (hit) out.push(name);
  }
  const workflows = files.filter((f) => /\.github\/workflows\/.*\.ya?ml$/.test(f.path));
  if (workflows.length) out.push(`.github/workflows (${workflows.length} file${workflows.length > 1 ? "s" : ""})`);
  return out.slice(0, 32);
}

export async function readReadme(reader: Reader, files: FileEntry[]): Promise<string | undefined> {
  const r = files.find((f) => !f.isDir && /^readme(\.(md|markdown|txt))?$/i.test(f.path.split("/").pop() ?? ""));
  if (!r) return undefined;
  const text = await reader(r.path);
  if (!text) return undefined;
  return text.slice(0, 3000);
}
