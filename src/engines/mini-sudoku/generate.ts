import { rngFromString, shuffle, type Rng } from "../core/rng";
import type { Difficulty } from "../core/types";
import { SUDOKU_GENERATOR_VERSION, type SudokuBoard, type SudokuCell } from "./model";
import { canPlace, countSolutions } from "./rules";

const TARGET_GIVENS: Record<Difficulty, number> = {
  easy: 22,
  medium: 16,
  hard: 12,
};

export function generateSudokuBoard(
  seed: string,
  difficulty: Difficulty,
  generatorVersion = SUDOKU_GENERATOR_VERSION,
): SudokuBoard {
  const rng = rngFromString(`${generatorVersion}|${difficulty}|${seed}`);
  const filled = fillGrid(rng);
  if (!filled) throw new Error("Não foi possível preencher um Mini Sudoku.");
  return carve(filled, rng, TARGET_GIVENS[difficulty]);
}

function fillGrid(rng: Rng): SudokuCell[] | null {
  const cells: SudokuCell[] = Array(36).fill(0);

  function search(i: number): boolean {
    if (i === 36) return true;
    const digits = shuffle([1, 2, 3, 4, 5, 6], rng);
    for (const d of digits) {
      if (!canPlace(cells, i, d)) continue;
      cells[i] = d as SudokuCell;
      if (search(i + 1)) return true;
    }
    cells[i] = 0;
    return false;
  }

  return search(0) ? cells : null;
}

function carve(filled: SudokuCell[], rng: Rng, givenCount: number): SudokuBoard {
  const givens = filled.slice();
  for (const at of shuffle(
    Array.from({ length: 36 }, (_, i) => i),
    rng,
  )) {
    const kept = givens.filter((g) => g !== 0).length;
    if (kept <= givenCount) break;
    const backup = givens[at];
    givens[at] = 0;
    if (countSolutions({ size: 6, givens }, 2) !== 1) givens[at] = backup;
  }
  return { size: 6, givens };
}
