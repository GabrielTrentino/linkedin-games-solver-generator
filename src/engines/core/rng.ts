export type Rng = () => number;

export function rngFromString(source: string): Rng {
  let a = 2166136261;
  for (let i = 0; i < source.length; i++) {
    a ^= source.charCodeAt(i);
    a = Math.imul(a, 16777619);
  }
  let state = a >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function rngInt(rng: Rng, max: number) {
  return Math.floor(rng() * max);
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = rngInt(rng, i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
