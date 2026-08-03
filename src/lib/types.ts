export type SourceKind = "folder" | "zip" | "github" | "apk" | "exe";

export interface FileEntry {
  path: string;
  isDir: boolean;
  size: number;
}

export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  children: TreeNode[];
}

export interface LangInfo {
  name: string;
  files: number;
  confidence: number;
  color: string;
}

export interface FrameworkInfo {
  name: string;
  confidence: number;
  source: string;
  role: "framework" | "library" | "runtime" | "build";
}

export interface Dependency {
  name: string;
  version: string;
  kind: "runtime" | "dev" | "unknown";
  manifest: string;
  pinned: boolean;
}

export interface ManifestDep {
  manifest: string;
  kind: string;
  runtime: number;
  dev: number;
  total: number;
  parseError?: string;
}

export type Severity = "high" | "medium" | "low" | "info";

export interface SecurityFinding {
  severity: Severity;
  category: string;
  message: string;
  file?: string;
  line?: number;
  evidence?: string;
}

export interface DepSummary {
  runtime: number;
  dev: number;
  unpinned: string[];
  duplicates: string[];
  heavyManifests: string[];
  byManifest: ManifestDep[];
}

export interface AiSection {
  content: string;
  model?: string;
  generatedAt: number;
}

export interface ProjectAnalysis {
  id: string;
  name: string;
  kind: SourceKind;
  label: string;
  importedAt: number;
  fileCount: number;
  totalSize: number;
  notes: string[];
  sourceMeta?: Record<string, string>;
  flat: FileEntry[];
  tree: TreeNode[];
  languages: LangInfo[];
  frameworks: FrameworkInfo[];
  manifests: string[];
  deps: Dependency[];
  depSummary: DepSummary;
  entryPoints: string[];
  buildSystems: string[];
  configFiles: string[];
  readmePreview?: string;
  security: SecurityFinding[];
  scanStats: { filesScanned: number; bytesScanned: number };
  architecture: AiSection | null;
  quality: AiSection | null;
  readme: AiSection | null;
}

export interface Settings {
  provider: "openrouter" | "ollama";
  apiKey: string;
  model: string;
  ollamaUrl: string;
}

export interface Progress {
  pct: number;
  label: string;
}

export interface ChatMsg {
  role: "user" | "assistant" | "system";
  content: string;
}

export type Tab =
  | "overview"
  | "architecture"
  | "dependencies"
  | "diagram"
  | "security"
  | "quality"
  | "file";
