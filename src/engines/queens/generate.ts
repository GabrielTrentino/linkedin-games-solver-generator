import { rngFromString, rngInt, shuffle, type Rng } from "../core/rng";
import type { Difficulty } from "../core/types";
import { QUEENS_GENERATOR_VERSION, type QueensBoard } from "./model";
import { countSolutions } from "./rules";

const SIZE: Record<Difficulty, number> = {
  easy: 7,
  medium: 8,
  hard: 9,
};

const SINGLETONS: Record<Difficulty, number> = {
  easy: 2,
  medium: 2,
  hard: 2,
};

export function generateQueensBoard(
  seed: string,
  difficulty: Difficulty,
  generatorVersion = QUEENS_GENERATOR_VERSION,
): QueensBoard {
  const rng = rngFromString(`${generatorVersion}|${difficulty}|${seed}`);
  const size = SIZE[difficulty];
  const singles = SINGLETONS[difficulty];

  for (let attempt = 0; attempt < 1500; attempt++) {
    const queens = placeQueens(size, rng);
    if (!queens) continue;
    const regions = growRegions(size, queens, rng, singles);
    if (!regions) continue;
    const board: QueensBoard = { size, regions };
    if (countSolutions(board, 2) === 1) return board;
  }

  throw new Error("Não foi possível gerar um Queens com solução única. Tente outro seed.");
}

function placeQueens(size: number, rng: Rng): number[] | null {
  for (let tryNo = 0; tryNo < 80; tryNo++) {
    const cols = shuffle(
      Array.from({ length: size }, (_, i) => i),
      rng,
    );
    let ok = true;
    for (let row = 1; row < size; row++) {
      if (Math.abs(cols[row] - cols[row - 1]) <= 1) {
        ok = false;
        break;
      }
    }
    if (ok) return cols;
  }
  return null;
}

function neighbors(size: number, at: number): number[] {
  const row = Math.floor(at / size);
  const col = at % size;
  const out: number[] = [];
  if (row > 0) out.push(at - size);
  if (row < size - 1) out.push(at + size);
  if (col > 0) out.push(at - 1);
  if (col < size - 1) out.push(at + 1);
  return out;
}

function growRegions(
  size: number,
  queenCols: number[],
  rng: Rng,
  singletonCount: number,
): number[] | null {
  const total = size * size;
  const regions = Array(total).fill(-1);
  queenCols.forEach((col, row) => {
    regions[row * size + col] = row;
  });

  const locked = new Set<number>(
    shuffle(
      Array.from({ length: size }, (_, i) => i),
      rng,
    ).slice(0, singletonCount),
  );

  let remaining = total - size;
  let guard = 0;
  while (remaining > 0 && guard < total * 80) {
    guard += 1;
    const frontier: Array<{ at: number; options: number[] }> = [];
    for (let at = 0; at < total; at++) {
      if (regions[at] !== -1) continue;
      const options = [
        ...new Set(
          neighbors(size, at)
            .map((n) => regions[n])
            .filter((id) => id >= 0 && !locked.has(id)),
        ),
      ];
      if (options.length) frontier.push({ at, options });
    }
    if (!frontier.length) {
      for (let at = 0; at < total; at++) {
        if (regions[at] !== -1) continue;
        const options = [
          ...new Set(
            neighbors(size, at)
              .map((n) => regions[n])
              .filter((id) => id >= 0),
          ),
        ];
        if (options.length) frontier.push({ at, options });
      }
    }
    if (!frontier.length) return null;
    const pick = frontier[rngInt(rng, frontier.length)];
    regions[pick.at] = pick.options[rngInt(rng, pick.options.length)];
    remaining -= 1;
  }

  if (regions.some((id) => id < 0)) return null;
  return regions;
}
