import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Menu, Radar, X } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { GoogleButton } from "../GoogleButton";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Pricing", href: "#pricing" },
  { label: "Documentation", href: "#docs" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        {/* Logo */}
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10">
            <Radar size={18} className="text-gold-400" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-wide text-zinc-100">
              RECON <span className="text-gold-400">AI</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">Workspace</div>
          </div>
        </a>

        {/* Center links (desktop) */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2.5 text-[13.5px] font-semibold text-ink-950 shadow-gold transition hover:from-gold-300 hover:to-gold-500"
            >
              <LayoutDashboard size={15} />
              Open dashboard
            </Link>
          ) : (
            <div className="hidden sm:block">
              <GoogleButton />
            </div>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/[0.06] bg-ink-950/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] text-zinc-300 hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-3 text-[14px] font-semibold text-ink-950"
                >
                  <LayoutDashboard size={15} />
                  Open dashboard
                </Link>
              ) : (
                <GoogleButton className="w-full" />
              )}
            </div>
          </div>
          <p className="mt-3 px-3 text-[11px] text-zinc-600">
            {loading ? "Checking session…" : "Secure Google sign-in · data stays private"}
          </p>
        </div>
      )}
    </header>
  );
}
