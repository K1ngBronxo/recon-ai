import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Radar, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { GoogleButton } from "../components/GoogleButton";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-ink-950 px-5 py-12 text-zinc-200">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      <Link to="/" className="absolute left-5 top-5 flex items-center gap-1.5 text-[13px] text-zinc-500 transition hover:text-gold-300">
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/[0.08] bg-ink-900/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
              <Radar size={26} className="text-gold-400" />
            </div>
            <h1 className="mt-5 text-[24px] font-bold tracking-tight text-zinc-50">
              Welcome back
            </h1>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-zinc-500">
              Sign in with your Google account to access your RECON AI workspace.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <GoogleButton label="Sign in with Google" size="lg" className="w-full" />
          </div>

          <div className="mt-8 space-y-2.5 border-t border-white/[0.06] pt-6">
            {[
              { icon: <KeyRound size={13} />, text: "Google-only authentication — no passwords" },
              { icon: <ShieldCheck size={13} />, text: "Protected by Firebase security rules" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-zinc-500">
                <span className="text-gold-500/80">{row.icon}</span>
                {row.text}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-zinc-600">
          New here?{" "}
          <Link to="/" className="text-gold-400 hover:text-gold-300">
            Learn what RECON AI can do
          </Link>
        </p>
      </div>
    </div>
  );
}
