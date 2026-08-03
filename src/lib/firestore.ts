import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getDbClient } from "./firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: number | null;
  lastLogin: number | null;
}

export interface UserPreferences {
  theme: "dark" | "light";
}

const userRef = (uid: string) => doc(getDbClient(), "users", uid);
const prefsRef = (uid: string) => doc(getDbClient(), "users", uid, "preferences", "app");

function tsToNum(v: unknown): number | null {
  if (v && typeof (v as Timestamp).toMillis === "function") return (v as Timestamp).toMillis();
  return null;
}

/** Create or update the Firestore profile for a signed-in Google user. */
export async function ensureUserProfile(user: User): Promise<void> {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  const base = {
    name: user.displayName ?? "User",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
  };
  if (snap.exists()) {
    await updateDoc(ref, { ...base, lastLogin: serverTimestamp() });
  } else {
    await setDoc(ref, { ...base, createdAt: serverTimestamp(), lastLogin: serverTimestamp() });
  }
}

/** Live-subscribe to the user's profile document. */
export function subscribeUserProfile(
  uid: string,
  cb: (p: UserProfile | null) => void
): () => void {
  return onSnapshot(
    userRef(uid),
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      const d = snap.data();
      cb({
        uid,
        name: d.name ?? "",
        email: d.email ?? "",
        photoURL: d.photoURL ?? "",
        createdAt: tsToNum(d.createdAt),
        lastLogin: tsToNum(d.lastLogin),
      });
    },
    () => cb(null)
  );
}

export async function loadUserPreferences(uid: string): Promise<UserPreferences> {
  try {
    const snap = await getDoc(prefsRef(uid));
    if (snap.exists()) {
      const d = snap.data();
      return { theme: d.theme === "light" ? "light" : "dark" };
    }
  } catch {
    /* fall through to defaults */
  }
  return { theme: "dark" };
}

export async function saveUserPreferences(uid: string, prefs: UserPreferences): Promise<void> {
  await setDoc(prefsRef(uid), prefs, { merge: true });
}
