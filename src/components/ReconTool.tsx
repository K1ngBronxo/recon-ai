import { useCallback, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  Boxes,
  Code2,
  FileText,
  FolderOpen,
  Radar,
  ShieldAlert,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { ChatMsg, Progress, ProjectAnalysis, Settings, Tab } from "../lib/types";
import type { Provider } from "../lib/providers";
import { providerFromDrop } from "../lib/providers";
import { loadHistory, loadSettings, saveHistory, saveSettings } from "../lib/store";
import { analyzeProject } from "../lib/recon/scanner";
import {
  architecturePrompt,
  buildDigest,
  chatMessages,
  createClient,
  newAiSection,
  qualityPrompt,
  readmePrompt,
} from "../lib/recon/ai";
import { downloadText, printReport, reportJson, reportMarkdown } from "../lib/recon/export";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./Chat";
import { Center } from "./Center";
import { ImportDialog } from "./ImportDialog";
import { SettingsDialog } from "./SettingsDialog";
import { Btn, Card } from "./ui";

function Welcome({ onImport, hasKey }: { onImport: () => void; hasKey: boolean }) {
  const features = [
    { icon: <FolderOpen size={18} />, title: "Import anything", desc: "Folder, ZIP, GitHub repo, APK or EXE — dropped anywhere." },
    { icon: <Boxes size={18} />, title: "Local scanning", desc: "Languages, frameworks, deps, entry points — all on-device." },
    { icon: <Workflow size={18} />, title: "Architecture maps", desc: "Mermaid diagrams + plain-English architecture explanations." },
    { icon: <ShieldAlert size={18} />, title: "Security & quality", desc: "Heuristic secret scan, code quality review, README generator." },
    { icon: <Sparkles size={18} />, title: "Project assistant", desc: "Ask anything about the code — with your OpenRouter key." },
    { icon: <FileText size={18} />, title: "Export reports", desc: "Markdown, JSON, or print-to-PDF summaries." },
  ];
  return (
    <main className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto bg-ink-900">
      <div className="flex w-full max-w-3xl flex-col items-center px-8 py-16">
        <div className="relative animate-fadeUp">
          <div className="absolute inset-0 -z-10 animate-pulseGold rounded-full" />
          <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-gold-500/25 bg-gradient-to-b from-ink-750 to-ink-900 shadow-card">
            <Radar size={52} className="animate-spinSlow text-gold-400" />
          </div>
        </div>
        <h1 className="mt-8 animate-fadeUp text-[42px] font-extrabold tracking-tight text-zinc-50">
          Understand any codebase <span className="text-gold-400">instantly</span>
        </h1>
        <p className="mt-4 max-w-xl animate-fadeUp text-center text-[16px] leading-relaxed text-zinc-400">
          Upload any software project, repository, APK, executable, or archive — RECON AI scans it
          locally and explains the architecture in plain English. Static inspection only; no
          protections are bypassed.
        </p>
        <div className="mt-8 flex animate-fadeUp items-center gap-4">
          <Btn variant="primary" size="md" icon={<Sparkles size={16} />} onClick={onImport}>
            Start an analysis
          </Btn>
          {!hasKey && (
            <span className="text-[13px] text-zinc-500">
              Tip: add an OpenRouter key in Settings for AI summaries & chat.
            </span>
          )}
        </div>

        <div className="mt-14 grid w-full animate-fadeUp grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="p-5 transition-all hover:-translate-y-1 hover-lift">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                {f.icon}
              </div>
              <div className="text-[14px] font-semibold text-zinc-100">{f.title}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * The full RECON AI workspace — project import, scanning, analysis tabs and
 * assistant. Rendered at the /app route inside the authenticated area.
 */
export function ReconTool({ onBack }: { onBack?: () => void }) {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const [history, setHistory] = useState<ProjectAnalysis[]>(loadHistory);
  const [current, setCurrent] = useState<{ a: ProjectAnalysis; provider: Provider | null } | null>(() => {
    const h = loadHistory();
    return h.length ? { a: h[0], provider: null } : null;
  });
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chat, setChat] = useState<Record<string, ChatMsg[]>>({});
  const [genBusy, setGenBusy] = useState<null | "architecture" | "quality" | "readme">(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const currentRef = useRef(current);
  currentRef.current = current;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const historyRef = useRef(history);
  historyRef.current = history;

  const flashMsg = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 3500);
  }, []);

  const persistHistory = useCallback((h: ProjectAnalysis[]) => {
    setHistory(h);
    saveHistory(h);
  }, []);

  const handleImport = useCallback(
    async (p: Provider | Promise<Provider>) => {
      const provider = await p;
      setProgress({ pct: 2, label: "Starting…" });
      try {
        const a = await analyzeProject(provider, (pr) => setProgress(pr));
        setCurrent({ a, provider });
        setTab("overview");
        setSelectedFile(null);
        persistHistory([a, ...historyRef.current.filter((x) => x.id !== a.id)]);
        flashMsg(`Imported ${a.name}`);
      } catch (e) {
        flashMsg(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
        throw e;
      } finally {
        setProgress(null);
      }
    },
    [persistHistory, flashMsg]
  );

  const selectProject = useCallback((a: ProjectAnalysis) => {
    setCurrent({ a, provider: null });
    setTab("overview");
    setSelectedFile(null);
  }, []);

  const deleteProject = useCallback(
    (id: string) => {
      const h = historyRef.current.filter((x) => x.id !== id);
      persistHistory(h);
      if (currentRef.current?.a.id === id) {
        const next = h[0];
        setCurrent(next ? { a: next, provider: null } : null);
        setSelectedFile(null);
      }
    },
    [persistHistory]
  );

  const readFile = useCallback(async (path: string): Promise<string | null> => {
    const p = currentRef.current?.provider;
    if (!p) return null;
    return p.readText(path);
  }, []);

  const setSection = useCallback(
    (key: "architecture" | "quality" | "readme", content: string) => {
      const c = currentRef.current;
      if (!c) return;
      const a2 = { ...c.a, [key]: newAiSection(content, settingsRef.current) };
      setCurrent({ ...c, a: a2 });
      persistHistory(historyRef.current.map((x) => (x.id === a2.id ? a2 : x)));
    },
    [persistHistory]
  );

  const generate = useCallback(
    async (section: "architecture" | "quality" | "readme") => {
      const c = currentRef.current;
      if (!c || genBusy) return;
      setGenBusy(section);
      try {
        const client = createClient(settingsRef.current);
        const digest = buildDigest(c.a);
        const msgs =
          section === "architecture"
            ? architecturePrompt(digest)
            : section === "quality"
              ? qualityPrompt(digest)
              : readmePrompt(digest);
        const content = await client.chat(msgs, { temperature: 0.3 });
        setSection(section, content);
        flashMsg(`AI ${section} generated`);
      } catch (e) {
        flashMsg(`AI error: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setGenBusy(null);
      }
    },
    [genBusy, setSection, flashMsg]
  );

  const sendChat = useCallback(
    async (question: string, fileContext?: { path: string; content: string }) => {
      const c = currentRef.current;
      if (!c) return;
      const id = c.a.id;
      const digest = buildDigest(c.a, fileContext ? { filePath: fileContext.path, fileContent: fileContext.content } : undefined);
      const historyMsgs = chat[id] ?? [];
      const next: ChatMsg[] = [...historyMsgs, { role: "user", content: question }];
      setChat((ch) => ({ ...ch, [id]: next }));
      setChatBusy(true);
      try {
        const client = createClient(settingsRef.current);
        const reply = await client.chat(chatMessages(digest, question, historyMsgs));
        setChat((ch) => ({ ...ch, [id]: [...next, { role: "assistant", content: reply }] }));
      } catch (e) {
        setChat((ch) => ({
          ...ch,
          [id]: [...next, { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : String(e)}` }],
        }));
      } finally {
        setChatBusy(false);
      }
    },
    [chat]
  );

  const askAboutFile = useCallback(
    async (path: string, content: string, explain = false) => {
      const question = explain ? `Explain this file in detail and highlight anything risky: ${path}` : `What does this file do, in context? ${path}`;
      await sendChat(question, { path, content });
    },
    [sendChat]
  );

  const doExport = useCallback(
    (kind: "md" | "json" | "pdf") => {
      const c = currentRef.current;
      if (!c) return;
      const slug = c.a.name.replace(/[^\w.-]+/g, "_");
      try {
        if (kind === "md") downloadText(`recon-${slug}.md`, reportMarkdown(c.a), "text/markdown");
        else if (kind === "json") downloadText(`recon-${slug}.json`, reportJson(c.a), "application/json");
        else printReport(c.a);
        flashMsg("Export started");
      } catch (e) {
        flashMsg(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
    [flashMsg]
  );

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const item = e.dataTransfer.items?.[0];
      if (!item) return;
      try {
        const p = await providerFromDrop(item);
        if (p) {
          await handleImport(p);
        } else {
          flashMsg("Unsupported drop. Use a folder, .zip, .apk or .exe.");
        }
      } catch (err) {
        flashMsg(err instanceof Error ? err.message : String(err));
      }
    },
    [handleImport, flashMsg]
  );

  const chatKey = current?.a.id ?? "";
  const chatMessagesForProject = chat[chatKey] ?? [];

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden bg-ink-900 text-zinc-200"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <TopBar
        progress={progress}
        hasProject={!!current}
        onNew={() => setImportOpen(true)}
        onImport={() => setImportOpen(true)}
        onExport={doExport}
        onSettings={() => setSettingsOpen(true)}
        onBack={onBack}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          history={history}
          currentId={current?.a.id ?? null}
          onSelect={selectProject}
          onDelete={deleteProject}
          tree={current?.a.tree ?? []}
          selectedFile={selectedFile}
          onSelectFile={(p) => {
            setSelectedFile(p);
            setTab("file");
          }}
        />

        {current ? (
          <Center
            a={current.a}
            tab={tab}
            setTab={setTab}
            selectedFile={selectedFile}
            readFile={readFile}
            onAskFile={askAboutFile}
            onGenerate={generate}
            genBusy={genBusy}
            hasKey={!!settings.apiKey || settings.provider === "ollama"}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : (
          <Welcome onImport={() => setImportOpen(true)} hasKey={!!settings.apiKey} />
        )}

        {current && (
          <ChatPanel
            messages={chatMessagesForProject}
            busy={chatBusy}
            model={settings.model}
            hasKey={!!settings.apiKey || settings.provider === "ollama"}
            selectedFile={selectedFile}
            onSend={(t) => sendChat(t)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
      </div>

      <ImportDialog open={importOpen} importing={!!progress} onClose={() => setImportOpen(false)} onImport={handleImport} />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(s) => {
          setSettingsState(s);
          saveSettings(s);
          flashMsg("Settings saved");
        }}
      />

      {dragOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
          <div className="rounded-3xl border-2 border-dashed border-gold-400 bg-gold-500/10 px-16 py-12 text-center">
            <div className="text-3xl font-bold text-gold-200">Drop to analyze</div>
            <div className="mt-2 text-[14px] text-zinc-400">Folder · ZIP · APK · EXE — inspected locally</div>
          </div>
        </div>
      )}

      {flash && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fadeUp rounded-xl border border-gold-500/40 bg-ink-800 px-5 py-3 text-[13px] text-gold-100 shadow-gold">
          {flash}
        </div>
      )}
    </div>
  );
}
