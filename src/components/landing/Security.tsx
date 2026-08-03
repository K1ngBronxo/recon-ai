import { KeyRound, Lock, ShieldCheck } from "lucide-react";

const ITEMS = [
  {
    icon: <KeyRound size={20} />,
    title: "Google authentication",
    desc: "Sign in exclusively through Google OAuth. No passwords to leak, no extra accounts to manage — Firebase Authentication verifies every request.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Firebase security",
    desc: "Firestore security rules restrict every user to their own documents. The rules ship with the project and are ready to deploy.",
  },
  {
    icon: <Lock size={20} />,
    title: "User data protection",
    desc: "Your profile, preferences and analysis history are stored in Firestore under your account. Nothing is shared, sold or exposed to other users.",
  },
];

export function Security() {
  return (
    <section id="about" className="border-t border-white/[0.06] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-400">Security</div>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight text-zinc-50 sm:text-[40px]">
            Security is foundational, not an afterthought
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
                {item.icon}
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-zinc-100">{item.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
