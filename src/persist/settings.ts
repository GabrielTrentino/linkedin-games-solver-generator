import type { HintLevel } from "../engines/core/types";

export type AppSettings = {
  autoCheck: boolean;
  autoMarkQueens: boolean;
  hintCap: HintLevel;
};

const KEY = "oficina-logica-settings";

const DEFAULTS: AppSettings = {
  autoCheck: true,
  autoMarkQueens: true,
  hintCap: 3,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
