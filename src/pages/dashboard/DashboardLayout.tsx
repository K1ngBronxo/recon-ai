import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  History,
  Home,
  LogOut,
  Menu,
  Radar,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { cn } from "../../components/ui";

const NAV = [
  { to: "/dashboard", end: true, label: "Home", icon: <Home size={16} /> },
  { to: "/app", end: false, label: "Main Tool", icon: <Sparkles size={16} /> },
  { to: "/dashboard/history", end: false, label: "History", icon: <History size={16} /> },
  { to: "/dashboard/settings", end: false, label: "Settings", icon: <Settings size={16} /> },
  { to: "/dashboard/profile", end: false, label: "Profile", icon: <UserRound size={16} /> },
];

export function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const displayName = profile?.name || user?.displayName || "User";
  const email = profile?.email || user?.email || "";
  const avatar = profile?.photoURL || user?.photoURL || "";

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10">
          <Radar size={18} className="text-gold-400" />
        </div>
        <div className="leading-tight">
          <div className="text-[14px] font-bold tracking-wide text-zinc-100">
            RECON <span className="text-gold-400">AI</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">Workspace</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all",
                isActive
                  ? "border border-gold-500/30 bg-gold-500/10 text-gold-200"
                  : "border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          {avatar ? (
            <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/15 text-gold-300">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-zinc-200">{displayName}</div>
            <div className="truncate text-[11px] text-zinc-600">{email || "Signed in"}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink-950 text-zinc-200">
      {/* Desktop sidebar */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-ink-900 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5"
              aria-label="Close menu"
            >
              <X size={17} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-ink-950/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={17} />
          </button>

          <div className="text-[14px] font-medium text-zinc-400">
            <span className="hidden text-zinc-600 sm:inline">Your workspace / </span>
            Dashboard
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[13px] font-medium text-zinc-200">{displayName}</div>
              <div className="text-[11px] text-zinc-600">{email || "Google account"}</div>
            </div>
            {avatar ? (
              <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-gold-500/30" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/30">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
