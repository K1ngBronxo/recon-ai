import { useEffect, useState } from "react";
import { Check, KeyRound, Loader2, Save, Sparkles } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { loadUserPreferences, saveUserPreferences } from "../../lib/firestore";
import { loadSettings, saveSettings } from "../../lib/store";
import type { Settings } from "../../lib/types";

export function SettingsPage() {
  const { user, profile } = useAuth();
  const [prefs, setPrefs] = useState<{ theme: "dark" | "light" }>({ theme: "dark" });
  const [ai, setAi] = useState<Settings>(loadSettings);
  const [saving, setSaving] = useState<null | "prefs" | "ai">(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadUserPreferences(user.uid)
      .then((p) => setPrefs(p))
      .catch(() => {});
  }, [user]);

  const flashSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleSavePrefs = async () => {
    if (!user) return;
    setSaving("prefs");
    try {
      await saveUserPreferences(user.uid, prefs);
      flashSaved();
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAi = async () => {
    saveSettings(ai);
    setSaving("ai");
    await new Promise((r) => setTimeout(r, 300));
    setSaving(null);
    flashSaved();
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-400">Settings</div>
      <h1 className="mt-1.5 text-[26px] font-bold tracking-tight text-zinc-50 sm:text-[30px]">Settings</h1>
      <p className="mt-1 text-[14px] text-zinc-500">Manage your preferences and AI provider.</p>

      {/* Account summary */}
      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        {profile?.photoURL || user?.photoURL ? (
          <img src={profile?.photoURL || user?.photoURL || ""} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-gold-500/30" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-xl font-bold text-gold-300">
            {(profile?.name || user?.displayName || "U").slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-zinc-100">{profile?.name || user?.displayName || "User"}</div>
          <div className="truncate text-[13px] text-zinc-500">{profile?.email || user?.email || ""}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
            <Check size={11} /> Google account
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-[15px] font-semibold text-zinc-100">Preferences</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[13.5px] text-zinc-200">Theme</div>
            <div className="text-[12px] text-zinc-500">Saved to your Firebase profile.</div>
          </div>
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPrefs({ theme: t })}
                className={`px-4 py-2 text-[13px] font-medium capitalize transition ${
                  prefs.theme === t ? "bg-gold-500/15 text-gold-200" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[12px] text-emerald-300">
              <Check size={13} /> Saved
            </span>
          )}
          <button
            onClick={handleSavePrefs}
            disabled={saving === "prefs"}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2 text-[13px] font-semibold text-ink-950 transition hover:from-gold-300 hover:to-gold-500 disabled:opacity-50"
          >
            {saving === "prefs" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save preferences
          </button>
        </div>
      </div>

      {/* AI provider */}
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-gold-400" />
          <h2 className="text-[15px] font-semibold text-zinc-100">AI provider</h2>
        </div>
        <p className="mt-1.5 text-[12.5px] text-zinc-500">
          These preferences are also used by the Main Tool. Bring your own OpenRouter key, or use a local Ollama server.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12.5px] font-medium text-zinc-300">Provider</span>
            <select
              value={ai.provider}
              onChange={(e) => setAi({ ...ai, provider: e.target.value as Settings["provider"] })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2.5 text-[13.5px] text-zinc-100 outline-none transition focus:border-gold-500/50"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Ollama (local)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[12.5px] font-medium text-zinc-300">Model</span>
            <input
              value={ai.model}
              onChange={(e) => setAi({ ...ai, model: e.target.value })}
              placeholder="openrouter/auto"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2.5 font-mono text-[13px] text-zinc-100 outline-none transition focus:border-gold-500/50"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-300">
            <KeyRound size={13} /> API key {ai.provider === "ollama" && <span className="text-zinc-600">(not needed for local)</span>}
          </span>
          <input
            type="password"
            value={ai.apiKey}
            onChange={(e) => setAi({ ...ai, apiKey: e.target.value })}
            placeholder="sk-or-…"
            autoComplete="off"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2.5 font-mono text-[13px] text-zinc-100 outline-none transition focus:border-gold-500/50"
          />
        </label>

        <div className="mt-5 flex items-center justify-end gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[12px] text-emerald-300">
              <Check size={13} /> Saved
            </span>
          )}
          <button
            onClick={handleSaveAi}
            disabled={saving === "ai"}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2 text-[13px] font-semibold text-ink-950 transition hover:from-gold-300 hover:to-gold-500 disabled:opacity-50"
          >
            {saving === "ai" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save AI settings
          </button>
        </div>
      </div>
    </div>
  );
}
