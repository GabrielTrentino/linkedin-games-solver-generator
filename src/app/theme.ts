import type { ThemeChoice } from "../persist/settings";

/**
 * `auto` segue `prefers-color-scheme`; `light` e `dark` fixam o tema via
 * `data-theme` no <html>. O index.html aplica o mesmo valor antes da primeira
 * pintura, para não piscar.
 */
export function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme;
}
