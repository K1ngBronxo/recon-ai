import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { FirebaseConfigError, getAuthClient, isFirebaseConfigured } from "./firebase";
import { ensureUserProfile, subscribeUserProfile, type UserProfile } from "./firestore";

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    let unsubProfile: (() => void) | null = null;
    const unsub = onAuthStateChanged(getAuthClient(), (u) => {
      setUser(u);
      if (u) {
        ensureUserProfile(u).catch(() => {});
        unsubProfile?.();
        unsubProfile = subscribeUserProfile(u.uid, setProfile);
      } else {
        unsubProfile?.();
        unsubProfile = null;
        setProfile(null);
      }
      setLoading(false);
    });
    return () => {
      unsub();
      unsubProfile?.();
    };
  }, [configured]);

  const signInWithGoogle = useCallback(async () => {
    if (!configured) throw new FirebaseConfigError();
    const auth = getAuthClient();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    // Profile ensurement is also handled by onAuthStateChanged, so a Firestore
    // rejection (e.g. rules not yet deployed) must not surface as a login failure.
    try {
      await ensureUserProfile(cred.user);
    } catch {
      /* ignore — the auth state listener will create/update the profile */
    }
  }, [configured]);

  const signOut = useCallback(async () => {
    await fbSignOut(getAuthClient());
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, configured, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

/** Map a thrown error to a friendly, user-facing message. */
export function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseConfigError) return err.message;
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before you finished. Please try again.";
    case "auth/network-request-failed":
      return "Network error — check your internet connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for Google sign-in. Add it in Firebase → Authentication → Settings.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked. Allow popups for this site and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}
