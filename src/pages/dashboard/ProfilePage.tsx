import { useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Mail, UserRound } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const name = profile?.name || user?.displayName || "User";
  const email = profile?.email || user?.email || "";
  const avatar = profile?.photoURL || user?.photoURL || "";
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-400">Profile</div>
      <h1 className="mt-1.5 text-[26px] font-bold tracking-tight text-zinc-50 sm:text-[30px]">Your account</h1>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06]">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-gold-500/[0.14] via-ink-850 to-ink-900" />
        <div className="relative bg-white/[0.02] px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            {avatar ? (
              <img src={avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-ink-950" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-500/15 text-2xl font-bold text-gold-300 ring-4 ring-ink-950">
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="pb-1">
              <div className="text-[18px] font-semibold text-zinc-100">{name}</div>
              {memberSince && (
                <div className="flex items-center gap-1.5 text-[12.5px] text-zinc-500">
                  <CalendarDays size={12} /> Member since {memberSince}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900/40 px-4 py-3">
              <Mail size={15} className="shrink-0 text-gold-400" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-600">Email</div>
                <div className="text-[13.5px] text-zinc-200">{email || "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900/40 px-4 py-3">
              <UserRound size={15} className="shrink-0 text-gold-400" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-600">Provider</div>
                <div className="text-[13.5px] text-zinc-200">Google</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
            <p className="text-[12px] text-zinc-600">
              Signed in with your Google account. Signing out returns you to the landing page.
            </p>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13.5px] font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
