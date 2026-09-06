import { rngFromString, rngInt, shuffle, type Rng } from "../core/rng";
import type { Difficulty } from "../core/types";
import {
  ZIP_GENERATOR_VERSION,
  hWallIndex,
  vWallIndex,
  zipIndex,
  type ZipBoard,
} from "./model";
import { countZipSolutions } from "./rules";

const SIZE: Record<Difficulty, number> = { easy: 6, medium: 6, hard: 7 };
const WALL_TARGET: Record<Difficulty, number> = { easy: 10, medium: 16, hard: 18 };

export function generateZipBoard(
  seed: string,
  difficulty: Difficulty,
  generatorVersion = ZIP_GENERATOR_VERSION,
): ZipBoard {
  const rng = rngFromString(`${generatorVersion}|${difficulty}|${seed}`);
  const size = SIZE[difficulty];
  for (let attempt = 0; attempt < 60; attempt++) {
    const path = hamPath(size, rng);
    if (!path) continue;
    const board = carve(path, size, rng, WALL_TARGET[difficulty]);
    if (countZipSolutions(board, 2) === 1) return board;
  }
  throw new Error("Não foi possível gerar um Zip com solução única. Tente outro seed.");
}

function hamPath(size: number, rng: Rng): number[] | null {
  const n = size * size;
  const start = rngInt(rng, n);
  const path: number[] = [];
  const vis = new Uint8Array(n);

  function degree(at: number): number {
    const r = Math.floor(at / size);
    const c = at % size;
    let d = 0;
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] as const) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
      if (!vis[zipIndex(size, rr, cc)]) d += 1;
    }
    return d;
  }

  function neigh(at: number): number[] {
    const r = Math.floor(at / size);
    const c = at % size;
    const out: number[] = [];
    for (const [dr, dc] of shuffle(
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as Array<[number, number]>,
      rng,
    )) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
      const nb = zipIndex(size, rr, cc);
      if (!vis[nb]) out.push(nb);
    }
    out.sort((a, b) => degree(a) - degree(b));
    return out;
  }

  function dfs(at: number): boolean {
    path.push(at);
    vis[at] = 1;
    if (path.length === n) return true;
    for (const nb of neigh(at)) {
      if (dfs(nb)) return true;
    }
    vis[at] = 0;
    path.pop();
    return false;
  }

  return dfs(start) ? path : null;
}

function carve(path: number[], size: number, rng: Rng, wallTarget: number): ZipBoard {
  const n = size * size;
  const onPath = new Set<string>();
  for (let i = 1; i < path.length; i++) {
    const a = Math.min(path[i - 1], path[i]);
    const b = Math.max(path[i - 1], path[i]);
    onPath.add(`${a}-${b}`);
  }

  const hWalls = Array(size * (size - 1)).fill(false);
  const vWalls = Array((size - 1) * size).fill(false);
  const extras: Array<{ kind: "h" | "v"; i: number }> = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 1; col++) {
      const a = zipIndex(size, row, col);
      const b = zipIndex(size, row, col + 1);
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      const i = hWallIndex(size, row, col);
      if (!onPath.has(key)) {
        hWalls[i] = true;
        extras.push({ kind: "h", i });
      }
    }
  }
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size; col++) {
      const a = zipIndex(size, row, col);
      const b = zipIndex(size, row + 1, col);
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      const i = vWallIndex(size, row, col);
      if (!onPath.has(key)) {
        vWalls[i] = true;
        extras.push({ kind: "h", i: i });
        extras[extras.length - 1] = { kind: "v", i };
      }
    }
  }

  const numbers: Array<number | null> = Array(n).fill(null);
  numbers[path[0]] = 1;
  numbers[path[n - 1]] = 2;
  const midCount = size <= 6 ? 2 : 3;
  const mids = shuffle(
    Array.from({ length: n - 2 }, (_, k) => k + 1),
    rng,
  ).slice(0, midCount);
  mids.sort((a, b) => a - b);
  let label = 2;
  for (const step of mids) {
    numbers[path[step]] = label;
    label += 1;
  }
  numbers[path[n - 1]] = label;

  const board: ZipBoard = { size, numbers, hWalls, vWalls };
  for (const extra of shuffle(extras, rng)) {
    const walls = extra.kind === "h" ? hWalls : vWalls;
    const kept = hWalls.filter(Boolean).length + vWalls.filter(Boolean).length;
    if (kept <= wallTarget) break;
    walls[extra.i] = false;
    if (countZipSolutions(board, 2) !== 1) walls[extra.i] = true;
  }
  return board;
}
