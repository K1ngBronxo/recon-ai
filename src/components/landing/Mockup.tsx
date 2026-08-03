import { Bot, FileText, LayoutDashboard, Package, Radar, ShieldAlert, Workflow } from "lucide-react";

/** Stylized product preview of the RECON AI workspace (pure CSS, no screenshots). */
export function Mockup() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gold-500/[0.06] blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-ink-850 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-zinc-500">
            <Radar size={11} className="text-gold-400" />
            recon.ai/workspace
          </div>
          <span className="w-12" />
        </div>

        <div className="grid grid-cols-[1.2fr_2fr_1.4fr] text-left">
          {/* Sidebar */}
          <div className="border-r border-white/[0.06] bg-ink-850/50 p-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Projects</div>
            {[
              { icon: <FileText size={11} />, name: "expressjs/express", active: true },
              { icon: <FileText size={11} />, name: "nextjs/next.js", active: false },
              { icon: <FileText size={11} />, name: "rust-lang/rust", active: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`mt-2.5 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] ${
                  p.active ? "bg-gold-500/10 text-gold-200" : "text-zinc-500"
                }`}
              >
                <span className={p.active ? "text-gold-400" : "text-zinc-600"}>{p.icon}</span>
                {p.name}
              </div>
            ))}
            <div className="mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Files</div>
            {["lib/", "test/", "index.js", "package.json"].map((f) => (
              <div key={f} className="mt-2 rounded-md px-2.5 py-1.5 font-mono text-[10px] text-zinc-500">
                {f}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="border-r border-white/[0.06] p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <LayoutDashboard size={11} className="text-gold-400" />
              Overview
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Files", value: "1,284" },
                { label: "Languages", value: "6" },
                { label: "Dependencies", value: "82" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-[9px] uppercase tracking-wider text-zinc-600">{s.label}</div>
                  <div className="mt-1 text-[20px] font-bold text-zinc-100">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Workflow size={11} className="text-gold-400" />
                Module relationships
              </div>
              <div className="mt-3 space-y-2">
                {[92, 78, 64, 50].map((w, i) => (
                  <div key={i} className="h-2 rounded-full bg-white/[0.04]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                      style={{ width: `${w}%`, opacity: 1 - i * 0.14 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assistant */}
          <div className="bg-ink-850/40 p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <Bot size={11} className="text-gold-400" />
              Project Assistant
            </div>
            <div className="mt-3 rounded-xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] p-3 text-[10px] leading-relaxed text-zinc-400">
              Express uses middleware chains to route HTTP requests. The <span className="text-gold-300">app.router.js</span>{" "}
              layer is where routing is resolved…
            </div>
            <div className="mt-2 ml-auto w-fit rounded-xl rounded-tr-md border border-gold-500/20 bg-gold-500/10 p-2.5 text-[10px] text-gold-200">
              How does auth work here?
            </div>
            <div className="mt-3 rounded-xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] p-3 text-[10px] leading-relaxed text-zinc-400">
              <span className="flex items-center gap-1 text-[9px] text-zinc-600">
                <ShieldAlert size={10} /> Security scan
              </span>
              Found 2 hardcoded-looking secrets in <span className="text-gold-300">config/</span>. Review them.
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-ink-800 px-2.5 py-2 text-[10px] text-zinc-600">
              <Package size={10} />
              Ask about this project…
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
