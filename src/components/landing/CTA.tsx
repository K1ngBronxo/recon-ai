import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { GoogleButton } from "../GoogleButton";

export function CTA() {
  return (
    <section id="pricing" className="border-t border-white/[0.06] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-b from-ink-850 to-ink-900 px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-180px] h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-gold-500/[0.08] blur-[100px]" />
          </div>
          <h2 className="text-[30px] font-bold tracking-tight text-zinc-50 sm:text-[40px]">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
            Sign in with your Google account and turn any codebase into a clear, actionable
            intelligence report — free to start.
          </p>
          <div className="mt-8 flex justify-center">
            <AuthCTA />
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-zinc-500">
            Free tier available <ArrowRight size={12} className="text-gold-500/60" /> No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}

function AuthCTA() {
  const { user } = useAuth();
  if (user) {
    return (
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-7 py-3.5 text-[15px] font-semibold text-ink-950 shadow-gold transition hover:from-gold-300 hover:to-gold-500"
      >
        <LayoutDashboard size={18} />
        Open your dashboard
      </Link>
    );
  }
  return <GoogleButton label="Sign in with Google" size="lg" />;
}
