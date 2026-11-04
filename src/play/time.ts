export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatWhen(ms: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

export function formatDateTime(ms: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

/** Maior passo "redondo" (5 s, 10 s, 15 s, 30 s, 1 min…) que deixa poucas marcas no eixo. */
export function niceStep(maxMs: number, targetTicks = 5) {
  const steps = [5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600].map((s) => s * 1000);
  const raw = maxMs / targetTicks;
  return steps.find((s) => s >= raw) ?? Math.ceil(raw / 3600000) * 3600000;
}
