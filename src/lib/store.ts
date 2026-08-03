import type { ProjectAnalysis, Settings } from "./types";

const K_SETTINGS = "recon.settings.v1";
const K_HISTORY = "recon.history.v1";
const HISTORY_CAP = 8;
const HISTORY_MAX_BYTES = 2.5 * 1024 * 1024;

export const DEFAULT_SETTINGS: Settings = {
  provider: "openrouter",
  apiKey: "",
  model: "openrouter/auto",
  ollamaUrl: "http://localhost:11434",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(K_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(K_SETTINGS, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

export function loadHistory(): ProjectAnalysis[] {
  try {
    const raw = localStorage.getItem(K_HISTORY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistory(list: ProjectAnalysis[]): void {
  const trimmed = list.slice(0, HISTORY_CAP);
  try {
    const json = JSON.stringify(trimmed);
    // If too big for localStorage, drop the largest analyses until it fits.
    if (json.length > HISTORY_MAX_BYTES) {
      let dropped = [...trimmed];
      while (dropped.length > 1 && JSON.stringify(dropped).length > HISTORY_MAX_BYTES) {
        dropped = dropped.slice(0, dropped.length - 1);
      }
      localStorage.setItem(K_HISTORY, JSON.stringify(dropped));
    } else {
      localStorage.setItem(K_HISTORY, json);
    }
  } catch {
    /* storage unavailable */
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export function fmtCount(n: number): string {
  return n.toLocaleString();
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString();
}
