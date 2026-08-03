import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { authErrorMessage, useAuth } from "../lib/auth";
import { FirebaseConfigError } from "../lib/firebase";
import { GoogleIcon } from "./GoogleIcon";
import { cn } from "./ui";

/**
 * Reusable Google sign-in button. Used on the landing page, login page
 * and anywhere a sign-in action is needed. After a successful sign-in the
 * user is redirected to /dashboard. Errors (popup closed, network, missing
 * config) are shown inline and also surfaced via onError when provided.
 */
export function GoogleButton({
  label = "Sign in with Google",
  className,
  size = "md",
  onError,
}: {
  label?: string;
  className?: string;
  size?: "md" | "lg";
  onError?: (msg: string) => void;
}) {
  const { signInWithGoogle, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClick = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      const msg =
        e instanceof FirebaseConfigError
          ? "Firebase isn't configured yet. Add your VITE_FIREBASE_* keys to a .env file (see .env.example) and restart the dev server."
          : authErrorMessage(e);
      setError(msg);
      onError?.(msg);
    } finally {
      setBusy(false);
    }
  }, [busy, signInWithGoogle, navigate, onError]);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || !!user}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold transition-all duration-150 select-none",
          "bg-white text-ink-950 hover:bg-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.08)]",
          "disabled:pointer-events-none disabled:opacity-60",
          size === "lg" ? "px-7 py-3.5 text-[15px]" : "px-5 py-2.5 text-[14px]",
          className
        )}
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon size={size === "lg" ? 20 : 18} />}
        {busy ? "Signing in…" : label}
      </button>
      {error && (
        <p className="flex max-w-sm items-start gap-1.5 text-left text-[12px] leading-snug text-amber-300">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
