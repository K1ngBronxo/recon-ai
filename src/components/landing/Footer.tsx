import { FileText, Globe, Mail, MessageCircle, Radar, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const SOCIALS = [
  { icon: <FileText size={16} />, label: "GitHub" },
  { icon: <Globe size={16} />, label: "Website" },
  { icon: <MessageCircle size={16} />, label: "Community" },
  { icon: <Mail size={16} />, label: "Contact" },
];

export function Footer() {
  return (
    <footer id="docs" className="border-t border-white/[0.06] bg-ink-950">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10">
                <Radar size={18} className="text-gold-400" />
              </div>
              <span className="text-[15px] font-bold tracking-wide text-zinc-100">
                RECON <span className="text-gold-400">AI</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              AI-powered software intelligence. Understand any codebase in plain English — fast,
              private, and secure.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-500 transition hover:border-gold-500/30 hover:text-gold-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Product</div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-zinc-400">
              <li><a href="#features" className="hover:text-gold-300">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-gold-300">How it works</a></li>
              <li><a href="#about" className="hover:text-gold-300">Security</a></li>
              <li><a href="#pricing" className="hover:text-gold-300">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Company</div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-zinc-400">
              <li><a href="#about" className="hover:text-gold-300">About</a></li>
              <li><a href="#docs" className="hover:text-gold-300">Documentation</a></li>
              <li><a href="#pricing" className="hover:text-gold-300">Changelog</a></li>
              <li><a href="#docs" className="hover:text-gold-300">Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Legal</div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-zinc-400">
              <li><a href="#docs" className="hover:text-gold-300">Privacy Policy</a></li>
              <li><a href="#docs" className="hover:text-gold-300">Terms of Service</a></li>
              <li><a href="#about" className="hover:text-gold-300">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
          <div className="flex items-center gap-2 text-[12px] text-zinc-600">
            <ShieldCheck size={13} className="text-gold-500/70" />
            © {new Date().getFullYear()} RECON AI. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[12px] text-zinc-600">
            <span>Made for developers</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <Link to="/login" className="hover:text-gold-300">Sign in</Link>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <FileText size={12} className="text-zinc-700" />
          </div>
        </div>
      </div>
    </footer>
  );
}
