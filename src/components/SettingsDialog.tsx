import { useEffect, useState } from "react";
import { Cpu, ExternalLink, KeyRound, Loader2, Save, X, Zap } from "lucide-react";
import type { Settings } from "../lib/types";
import { OPENROUTER_MODELS, createClient } from "../lib/recon/ai";
import { Btn, cn } from "./ui";

export function SettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (s: Settings) => void;
}) {
  const [s, setS] = useState<Settings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [customModel, setCustomModel] = useState(false);

  useEffect(() => {
    if (open) {
      setS(settings);
      setResult(null);
      setCustomModel(!OPENROUTER_MODELS.some((m) => m.id === settings.model));
    }
  }, [open, settings]);

  if (!open) return null;

  const test = async () => {
    setTesting(true);
    setResult(null);
    try {
      const client = createClient(s);
      const reply = await client.chat(
        [{ role: "user", content: "Reply with exactly: OK" }],
        { temperature: 0 }
      );
      setResult({ ok: true, msg: reply.slice(0, 80) });
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setTesting(false);
    }
  };

  const modelSelect = customModel ? (
    <input
      value={s.model}
      onChange={(e) => setS({ ...s, model: e.target.value })}
      placeholder="openrouter/model-slug"
      className="w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-gold-500/50"
    />
  ) : (
    <select
      value={s.model}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "__custom") {
          setCustomModel(true);
        } else {
          setS({ ...s, model: v });
        }
      }}
      className="w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-gold-500/50"
    >
      {OPENROUTER_MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
      <option value="__custom">Custom model slug…</option>
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fadeUp rounded-2xl border border-white/10 bg-ink-850 shadow-card">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-100">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Provider */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              AI provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "openrouter", label: "OpenRouter", desc: "Default · cloud", icon: <Zap size={15} /> },
                  { id: "ollama", label: "Ollama", desc: "Local · free", icon: <Cpu size={15} /> },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setS({ ...s, provider: p.id, model: p.id === "ollama" ? "llama3.2" : s.model })}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    s.provider === p.id
                      ? "border-gold-500/50 bg-gold-500/10"
                      : "border-white/8 bg-white/[0.03] hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-100">
                    {p.icon}
                    {p.label}
                  </div>
                  <div className="text-[11px] text-zinc-500">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {s.provider === "openrouter" ? (
            <>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <KeyRound size={12} />
                  OpenRouter API key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value={s.apiKey}
                    onChange={(e) => setS({ ...s, apiKey: e.target.value })}
                    placeholder="sk-or-v1-…"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-gold-500/50"
                  />
                  <Btn onClick={() => setShowKey((v) => !v)}>{showKey ? "Hide" : "Show"}</Btn>
                </div>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-gold-300/80 hover:text-gold-200"
                >
                  <ExternalLink size={11} />
                  Get a free key at openrouter.ai/keys
                </a>
                <div className="mt-1.5 text-[11px] text-zinc-600">
                  Stored only on this device (localStorage). Never sent anywhere except OpenRouter.
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Model
                </label>
                {modelSelect}
                <div className="mt-1.5 text-[11px] text-zinc-600">
                  Curated list — any OpenRouter model slug works via “Custom model slug”.
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Ollama URL
                </label>
                <input
                  value={s.ollamaUrl}
                  onChange={(e) => setS({ ...s, ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-gold-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Model name
                </label>
                <input
                  value={s.model}
                  onChange={(e) => setS({ ...s, model: e.target.value })}
                  placeholder="llama3.2"
                  className="w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-gold-500/50"
                />
                <div className="mt-1.5 text-[11px] text-zinc-600">
                  Make sure the model is pulled: <code className="text-gold-300">ollama pull llama3.2</code>
                </div>
              </div>
            </>
          )}

          {result && (
            <div
              className={cn(
                "rounded-xl border px-4 py-2.5 text-[13px]",
                result.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/30 bg-red-500/10 text-red-200"
              )}
            >
              {result.ok ? `Connected ✓ — ${result.msg}` : result.msg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-4">
            <Btn onClick={test} disabled={testing || (s.provider === "openrouter" && !s.apiKey)}>
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Test connection
            </Btn>
            <Btn
              variant="primary"
              icon={<Save size={14} />}
              onClick={() => {
                onSave(s);
                onClose();
              }}
            >
              Save settings
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
