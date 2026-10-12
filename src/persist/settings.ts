import type { HintLevel } from "../engines/core/types";

export type ThemeChoice = "auto" | "light" | "dark";

export type AppSettings = {
  autoCheck: boolean;
  autoMarkQueens: boolean;
  hintCap: HintLevel;
  theme: ThemeChoice;
};

const KEY = "oficina-logica-settings";

const DEFAULTS: AppSettings = {
  autoCheck: true,
  autoMarkQueens: true,
  hintCap: 3,
  theme: "auto",
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

/** Grava os ajustes. Devolve `false` se o navegador bloquear o armazenamento. */
export function saveSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
