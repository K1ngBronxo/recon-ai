import { KeyRound, Plug, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: <KeyRound size={18} />,
    step: "Step 1",
    title: "Sign in with Google",
    desc: "One click, no passwords. Your profile is created automatically and your workspace is secured by Firebase Authentication.",
  },
  {
    icon: <Plug size={18} />,
    step: "Step 2",
    title: "Connect your workspace",
    desc: "Import a folder, ZIP, GitHub repo, APK or EXE — or bring your own AI key to unlock summaries, chat and reviews.",
  },
  {
    icon: <Sparkles size={18} />,
    step: "Step 3",
    title: "Use the AI tools instantly",
    desc: "Architecture maps, dependency analysis, security reviews and an AI assistant — all ready the moment you are.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-white/[0.06] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-400">How it works</div>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight text-zinc-50 sm:text-[40px]">
            From sign-in to insight in three steps
          </h2>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute left-[16.6%] right-[16.6%] top-[26px] hidden h-px bg-gradient-to-r from-gold-500/40 via-gold-500/20 to-gold-500/40 md:block" />
          {STEPS.map((s) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-gold-500/25 bg-ink-850 text-gold-400 shadow-gold">
                {s.icon}
              </div>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-500/80">{s.step}</div>
              <h3 className="mt-1.5 text-[16px] font-semibold text-zinc-100">{s.title}</h3>
              <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
