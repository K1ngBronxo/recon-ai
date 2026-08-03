// AI provider abstraction. OpenRouter is the default backend; the client
// interface lets future providers (Gemini, local Ollama, etc.) drop in
// without touching the UI. Prompts are designed around a compact project
// digest so only concise context is ever sent to the model.
import type { AiSection, ChatMsg, ProjectAnalysis, Settings } from "../types";
import { fmtBytes, fmtCount } from "../store";

export interface AIProviderDef {
  id: string;
  label: string;
}

export const OPENROUTER_MODELS: AIProviderDef[] = [
  { id: "openrouter/auto", label: "OpenRouter Auto (recommended)" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { id: "qwen/qwen-2.5-72b-instruct", label: "Qwen 2.5 72B" },
];

export interface AIClient {
  id: string;
  chat(messages: ChatMsg[], opts?: { temperature?: number }): Promise<string>;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function chatOpenRouter(settings: Settings, messages: ChatMsg[], opts?: { temperature?: number }): Promise<string> {
  if (!settings.apiKey) throw new Error("No API key configured. Open Settings and add your OpenRouter key.");
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
          "HTTP-Referer": "https://recon-ai.local",
          "X-Title": "RECON AI",
        },
        body: JSON.stringify({
          model: settings.model || "openrouter/auto",
          messages,
          temperature: opts?.temperature ?? 0.3,
          max_tokens: 4000,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
      }
      const j = await res.json();
      const content = j?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new Error("Empty model response");
      return content;
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await sleep(1000 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function chatOllama(settings: Settings, messages: ChatMsg[], opts?: { temperature?: number }): Promise<string> {
  const base = (settings.ollamaUrl || "http://localhost:11434").replace(/\/+$/, "");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: settings.model || "llama3.2",
      messages,
      stream: false,
      options: { temperature: opts?.temperature ?? 0.3 },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}: ${body.slice(0, 200)}`);
  }
  const j = await res.json();
  if (typeof j?.message?.content === "string") return j.message.content;
  throw new Error("Ollama returned no content — is the model pulled?");
}

export function createClient(settings: Settings): AIClient {
  if (settings.provider === "ollama") {
    return { id: "ollama", chat: (m, o) => chatOllama(settings, m, o) };
  }
  return { id: "openrouter", chat: (m, o) => chatOpenRouter(settings, m, o) };
}

// ---------------------------------------------------------------------------
// Context digest
// ---------------------------------------------------------------------------

function treeDigest(nodes: Array<{ name: string; path: string; isDir: boolean; children: any[] }>, depth = 0, maxDepth = 3, budget = 90): string[] {
  if (depth > maxDepth || budget <= 0) return [];
  const out: string[] = [];
  for (const n of nodes) {
    if (budget <= 0) break;
    budget--;
    const indent = "  ".repeat(depth);
    out.push(`${indent}${n.isDir ? "📁" : "📄"} ${n.path}`);
    if (n.isDir && n.children.length) out.push(...treeDigest(n.children, depth + 1, maxDepth, budget));
  }
  return out;
}

export function buildDigest(
  a: ProjectAnalysis,
  opts?: { filePath?: string; fileContent?: string }
): string {
  const lines: string[] = [];
  lines.push(`PROJECT: ${a.name} (${a.label})`);
  lines.push(`SOURCE: ${a.kind} — ${fmtCount(a.fileCount)} files, ${fmtBytes(a.totalSize)}`);
  if (a.languages.length) lines.push(`LANGUAGES: ${a.languages.slice(0, 8).map((l) => `${l.name} (${l.files})`).join(", ")}`);
  if (a.frameworks.length) lines.push(`FRAMEWORKS: ${a.frameworks.map((f) => `${f.name} (${Math.round(f.confidence * 100)}%)`).join(", ")}`);
  if (a.entryPoints.length) lines.push(`ENTRY POINTS: ${a.entryPoints.slice(0, 6).join("; ")}`);
  if (a.buildSystems.length) lines.push(`BUILD: ${a.buildSystems.join(", ")}`);
  lines.push(`MANIFESTS: ${a.manifests.join(", ") || "none"}`);
  if (a.deps.length) {
    lines.push(`DEPENDENCIES (${a.deps.length}): ${a.deps.slice(0, 40).map((d) => `${d.name}@${d.version}`).join(", ")}${a.deps.length > 40 ? " …" : ""}`);
  }
  if (a.security.filter((f) => f.severity === "high").length) {
    lines.push(`HIGH-RISK FINDINGS: ${a.security.filter((f) => f.severity === "high").map((f) => f.message).join("; ")}`);
  }
  lines.push("");
  lines.push("FILE TREE (top levels):");
  lines.push(...treeDigest(a.tree));
  if (opts?.filePath) {
    lines.push("");
    lines.push(`SELECTED FILE: ${opts.filePath}`);
    lines.push(`FILE CONTENT (${(opts.fileContent ?? "").length} chars):`);
    lines.push("```");
    lines.push((opts.fileContent ?? "").slice(0, 8000));
    lines.push("```");
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const SYS = "You are RECON AI, an expert software analyst that explains codebases in plain English. Be concrete, structured with Markdown headings and bullet lists, and honest about uncertainty. Never invent files or dependencies that are not shown in the context.";

export function architecturePrompt(digest: string): ChatMsg[] {
  return [
    { role: "system", content: SYS },
    {
      role: "user",
      content: `Analyze this project and explain its architecture in simple language.\n\n${digest}\n\nCover: 1) project purpose, 2) overall architecture, 3) data flow, 4) main modules and their responsibilities, 5) key components, 6) configuration, 7) build & run process. End with 3-5 "first things to understand" tips.`,
    },
  ];
}

export function qualityPrompt(digest: string): ChatMsg[] {
  return [
    { role: "system", content: SYS },
    {
      role: "user",
      content: `Review the code quality of this project based on the context below.\n\n${digest}\n\nCover: overall maintainability (score 0-10), complexity hotspots, naming consistency, project organization, and a prioritized list of suggested improvements. Be specific but don't guess about code you can't see.`,
    },
  ];
}

export function readmePrompt(digest: string): ChatMsg[] {
  return [
    { role: "system", content: SYS },
    {
      role: "user",
      content: `Write a README.md for this project based on the context below.\n\n${digest}\n\nInclude: overview, install steps (from the detected tooling), project structure explanation, main features, usage examples, and a suggested README skeleton. Output raw Markdown only.`,
    },
  ];
}

export function explainFilePrompt(digest: string, filePath: string): ChatMsg[] {
  return [
    { role: "system", content: SYS },
    {
      role: "user",
      content: `Explain this file in the context of the project.\n\n${digest}\n\nExplain what ${filePath} does, its purpose, what it depends on, what depends on it (if inferable), and anything notable or risky. Use Markdown with short sections.`,
    },
  ];
}

export function chatMessages(digest: string, question: string, history: ChatMsg[]): ChatMsg[] {
  const context: ChatMsg = {
    role: "system",
    content: `${SYS}\n\nProject context:\n${digest}`,
  };
  return [context, ...history.slice(-8), { role: "user", content: question }];
}

export function newAiSection(content: string, settings: Settings): AiSection {
  return { content, model: settings.model || "unknown", generatedAt: Date.now() };
}
