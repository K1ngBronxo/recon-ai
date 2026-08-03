import { Link } from "react-router-dom";
import { ArrowRight, Clock, FileText, Sparkles, Workflow } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { fmtTime, loadHistory } from "../../lib/store";

export function HomePage() {
  const { user, profile } = useAuth();
  const history = loadHistory();
  const firstName = (profile?.name || user?.displayName || "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-400">
            Welcome back
          </div>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-tight text-zinc-50 sm:text-[30px]">
            {firstName}
          </h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Your AI-powered project intelligence workspace.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          to="/app"
          className="group rounded-2xl border border-gold-500/25 bg-gradient-to-b from-gold-500/[0.12] to-transparent p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/45"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
              <Sparkles size={18} />
            </div>
            <ArrowRight size={16} className="text-gold-500/60 transition group-hover:translate-x-1 group-hover:text-gold-300" />
          </div>
          <div className="mt-4 text-[15px] font-semibold text-zinc-100">Open Main Tool</div>
          <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            Analyze any project — folder, ZIP, GitHub, APK or EXE.
          </div>
        </Link>

        <Link
          to="/dashboard/history"
          className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-white/[0.14]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
              <Clock size={18} />
            </div>
            <ArrowRight size={16} className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-gold-300" />
          </div>
          <div className="mt-4 text-[15px] font-semibold text-zinc-100">Recent analyses</div>
          <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            {history.length ? `${history.length} project${history.length === 1 ? "" : "s"} in your history.` : "No analyses yet — your history lives here."}
          </div>
        </Link>

        <Link
          to="/dashboard/settings"
          className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-white/[0.14]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
              <Workflow size={18} />
            </div>
            <ArrowRight size={16} className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-gold-300" />
          </div>
          <div className="mt-4 text-[15px] font-semibold text-zinc-100">Configure your AI</div>
          <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            Choose your model & provider, or bring your own API key.
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-zinc-200">Recent activity</h2>
          <Link to="/dashboard/history" className="text-[13px] text-gold-400 hover:text-gold-300">
            View all
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-14 text-center">
            <FileText size={26} className="text-zinc-600" />
            <div className="mt-3 text-[15px] font-medium text-zinc-300">No analyses yet</div>
            <p className="mt-1 max-w-sm text-[13px] text-zinc-500">
              Open the Main Tool, import a project, and your activity will show up here.
            </p>
            <Link
              to="/app"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-5 py-2.5 text-[13.5px] font-semibold text-ink-950 transition hover:from-gold-300 hover:to-gold-500"
            >
              <Sparkles size={14} />
              Start an analysis
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/app"
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-gold-500/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gold-400">{p.label}</span>
                </div>
                <div className="mt-2 truncate text-[14px] font-medium text-zinc-100">{p.name}</div>
                <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-zinc-600">
                  <span>{p.languages.slice(0, 2).map((l) => l.name).join(", ") || "—"}</span>
                  <span className="text-zinc-700">·</span>
                  <span>{fmtTime(p.importedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
