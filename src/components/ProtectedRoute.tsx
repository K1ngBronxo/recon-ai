import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Radar } from "lucide-react";
import { useAuth } from "../lib/auth";

function FullScreenLoader({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 text-zinc-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
        <Radar size={26} className="animate-spinSlow text-gold-400" />
      </div>
      <div className="flex items-center gap-2 text-[13px] text-zinc-500">
        <Loader2 size={14} className="animate-spin" />
        {message}
      </div>
    </div>
  );
}

/** Guards private routes: redirects unauthenticated users to the landing page. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader message="Checking your session…" />;
  }

  if (!configured) {
    return (
      <FullScreenLoader message="Firebase isn't configured — add your VITE_FIREBASE_* keys to .env" />
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
