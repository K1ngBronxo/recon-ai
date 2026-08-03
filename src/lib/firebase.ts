import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase is initialized lazily so the app can build, run and preview
 * even before the user has added their own keys to `.env`.
 */

export class FirebaseConfigError extends Error {
  constructor() {
    super(
      "Firebase is not configured yet. Add your VITE_FIREBASE_* keys to a .env file (see .env.example) and restart the dev server."
    );
    this.name = "FirebaseConfigError";
  }
}

export interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/** Read Firebase credentials from Vite env vars. Returns null when missing. */
export function firebaseEnv(): FirebaseEnv | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  };
}

export function isFirebaseConfigured(): boolean {
  return firebaseEnv() !== null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getApp(): FirebaseApp {
  if (app) return app;
  const env = firebaseEnv();
  if (!env) throw new FirebaseConfigError();
  app = initializeApp(env);
  return app;
}

export function getAuthClient(): Auth {
  if (auth) return auth;
  auth = getAuth(getApp());
  return auth;
}

export function getDbClient(): Firestore {
  if (db) return db;
  db = getFirestore(getApp());
  return db;
}
