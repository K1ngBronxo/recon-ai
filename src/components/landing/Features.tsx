import {
  Brain,
  Cloud,
  Cpu,
  Gauge,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Brain size={20} />,
    title: "AI-powered assistance",
    desc: "Plain-English explanations of architecture, data flow and modules — generated from a compact digest of your project.",
  },
  {
    icon: <Cpu size={20} />,
    title: "Deep code understanding",
    desc: "Language, framework, dependency and entry-point detection that runs entirely on your device, before any AI is involved.",
  },
  {
    icon: <Workflow size={20} />,
    title: "Smart workflows",
    desc: "From import to architecture map to security review in one flow — no setup, no configuration ceremony.",
  },
  {
    icon: <Gauge size={20} />,
    title: "Fast productivity tools",
    desc: "Drag in a folder, ZIP, GitHub repo, APK or EXE and get an interactive report in seconds, not hours.",
  },
  {
    icon: <Cloud size={20} />,
    title: "Secure cloud access",
    desc: "Sign in with your Google account, sync your projects, and pick up exactly where you left off on any device.",
  },
  {
    icon: <UserRound size={20} />,
    title: "Personalized experience",
    desc: "Choose your preferred AI model and provider. Bring your own key or start with the free default configuration.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-white/[0.06] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-400">Features</div>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight text-zinc-50 sm:text-[40px]">
            Everything you need to understand software
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            A professional workspace that turns unfamiliar code into a clear, actionable picture.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:-translate-y-1 hover:border-gold-500/30 hover:bg-white/[0.03]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-400 transition group-hover:scale-105">
                {f.icon}
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Security mini-strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4">
          <div className="flex items-center gap-2 text-[13px] text-zinc-400">
            <ShieldCheck size={15} className="text-gold-400" /> Google authentication
          </div>
          <div className="flex items-center gap-2 text-[13px] text-zinc-400">
            <Sparkles size={15} className="text-gold-400" /> AI on your terms
          </div>
          <div className="flex items-center gap-2 text-[13px] text-zinc-400">
            <ShieldCheck size={15} className="text-gold-400" /> Static inspection only
          </div>
        </div>
      </div>
    </section>
  );
}
