import { rngFromString, rngInt, type Rng } from "../core/rng";
import type { Difficulty } from "../core/types";
import {
  PATCHES_GENERATOR_VERSION,
  patchesIndex,
  shapeOf,
  type PatchClue,
  type PatchRect,
  type PatchShape,
  type PatchesBoard,
} from "./model";
import { countPatchesSolutions } from "./rules";

const SIZE: Record<Difficulty, number> = { easy: 6, medium: 7, hard: 8 };

export function generatePatchesBoard(
  seed: string,
  difficulty: Difficulty,
  generatorVersion = PATCHES_GENERATOR_VERSION,
): PatchesBoard {
  const rng = rngFromString(`${generatorVersion}|${difficulty}|${seed}`);
  const n = SIZE[difficulty];
  for (let attempt = 0; attempt < 40; attempt++) {
    const rects = split(0, 0, n, n, rng);
    const clues = placeClues(rects, n, rng, difficulty);
    const board: PatchesBoard = { rows: n, cols: n, clues };
    if (countPatchesSolutions(board, 2) === 1) return board;
    for (const clue of clues) {
      if (clue.shape !== "any") continue;
      const rect = rects.find((r) => contains(r, n, clue.at));
      if (!rect) continue;
      clue.shape = shapeOf(rect.h, rect.w);
      if (countPatchesSolutions(board, 2) === 1) return board;
    }
  }
  throw new Error("Não foi possível gerar Patches com solução única. Tente outro seed.");
}

function contains(rect: PatchRect, cols: number, at: number) {
  const row = Math.floor(at / cols);
  const col = at % cols;
  return row >= rect.row && row < rect.row + rect.h && col >= rect.col && col < rect.col + rect.w;
}

function split(row: number, col: number, h: number, w: number, rng: Rng): PatchRect[] {
  const area = h * w;
  const tooSmall = area <= 4 || h === 1 || w === 1;
  if (tooSmall || (area <= 10 && rng() < 0.45)) {
    return [{ row, col, h, w }];
  }
  if (w >= h && w > 1) {
    const cut = 1 + rngInt(rng, w - 1);
    return [...split(row, col, h, cut, rng), ...split(row, col + cut, h, w - cut, rng)];
  }
  const cut = 1 + rngInt(rng, h - 1);
  return [...split(row, col, cut, w, rng), ...split(row + cut, col, h - cut, w, rng)];
}

function placeClues(rects: PatchRect[], n: number, rng: Rng, difficulty: Difficulty): PatchClue[] {
  return rects.map((rect) => {
    const rr = rect.row + rngInt(rng, rect.h);
    const cc = rect.col + rngInt(rng, rect.w);
    let shape: PatchShape = "any";
    if (difficulty === "hard") shape = shapeOf(rect.h, rect.w);
    else if (difficulty === "medium" && rng() < 0.5) shape = shapeOf(rect.h, rect.w);
    return { at: patchesIndex({ rows: n, cols: n, clues: [] }, rr, cc), area: rect.h * rect.w, shape };
  });
}
