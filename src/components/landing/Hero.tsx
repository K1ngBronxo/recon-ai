import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { GoogleButton } from "../GoogleButton";
import { Mockup } from "./Mockup";

export function Hero() {
  const { user } = useAuth();
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-20 text-center sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-gold-300">
          <Sparkles size={12} />
          Your intelligent workspace powered by AI
        </div>

        <h1 className="mt-6 max-w-3xl text-[40px] font-extrabold leading-[1.08] tracking-tight text-zinc-50 sm:text-[58px]">
          Understand any codebase, <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">instantly</span>
        </h1>

        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-zinc-400 sm:text-[17px]">
          RECON AI scans any software project, repository or package — then explains the
          architecture, dependencies and risks in plain English. Sign in once, analyze anything.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-7 py-3.5 text-[15px] font-semibold text-ink-950 shadow-gold transition hover:from-gold-300 hover:to-gold-500"
            >
              <LayoutDashboard size={18} />
              Go to your dashboard
            </Link>
          ) : (
            <GoogleButton label="Continue with Google" size="lg" />
          )}
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-[15px] font-semibold text-zinc-200 transition hover:border-gold-500/40 hover:text-gold-200"
          >
            Explore Features
            <ArrowRight size={16} />
          </a>
        </div>

        <p className="mt-4 text-[12px] text-zinc-600">
          Free to start · Google authentication · Your data stays yours
        </p>

        <div className="mt-16 w-full">
          <Mockup />
        </div>
      </div>
    </section>
  );
}
