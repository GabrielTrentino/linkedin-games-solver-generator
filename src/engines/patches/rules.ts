import type { RuleViolation } from "../core/types";
import {
  clueAtCell,
  patchesCol,
  patchesRow,
  rectCells,
  shapeOk,
  type PatchClue,
  type PatchRect,
  type PatchesBoard,
  type PatchesState,
} from "./model";

export function rectValid(board: PatchesBoard, rect: PatchRect, used: Set<number>): string | null {
  if (rect.h < 1 || rect.w < 1) return "empty";
  if (rect.row < 0 || rect.col < 0 || rect.row + rect.h > board.rows || rect.col + rect.w > board.cols) {
    return "bounds";
  }
  const cells = rectCells(board, rect);
  const clues = cells.map((at) => clueAtCell(board, at)).filter(Boolean) as PatchClue[];
  if (clues.length !== 1) return "clue";
  const clue = clues[0];
  if (clue.area !== cells.length) return "area";
  if (!shapeOk(clue.shape, rect.h, rect.w)) return "shape";
  if (cells.some((at) => used.has(at))) return "overlap";
  return null;
}

export function usedCells(board: PatchesBoard, rects: PatchRect[]): Set<number> {
  const used = new Set<number>();
  for (const rect of rects) for (const at of rectCells(board, rect)) used.add(at);
  return used;
}

export function validatePatches(board: PatchesBoard, state: PatchesState): RuleViolation[] {
  const issues: RuleViolation[] = [];
  const used = new Set<number>();
  for (const rect of state.rects) {
    const err = rectValid(board, rect, used);
    if (err) {
      issues.push({ code: err, message: messageFor(err) });
    }
    for (const at of rectCells(board, rect)) used.add(at);
  }
  return issues;
}

function messageFor(code: string) {
  if (code === "overlap") return "Os retângulos não podem se sobrepor.";
  if (code === "area") return "A área do retângulo precisa bater com a pista.";
  if (code === "shape") return "A forma da pista não combina com este retângulo.";
  if (code === "clue") return "Cada retângulo leva exatamente uma pista.";
  return "Retângulo inválido.";
}

export function isPatchesSolved(board: PatchesBoard, state: PatchesState): boolean {
  if (validatePatches(board, state).length > 0) return false;
  const used = usedCells(board, state.rects);
  return used.size === board.rows * board.cols && state.rects.length === board.clues.length;
}

export function conflictingCells(board: PatchesBoard, state: PatchesState): Set<number> {
  const bad = new Set<number>();
  const used = new Set<number>();
  for (const rect of state.rects) {
    const err = rectValid(board, rect, used);
    const cells = rectCells(board, rect);
    if (err) for (const at of cells) bad.add(at);
    for (const at of cells) used.add(at);
  }
  return bad;
}

function possibleRects(board: PatchesBoard, clue: PatchClue, used: Set<number>): PatchRect[] {
  const cr = patchesRow(board, clue.at);
  const cc = patchesCol(board, clue.at);
  const out: PatchRect[] = [];
  for (let h = 1; h <= board.rows; h++) {
    if (clue.area % h !== 0) continue;
    const w = clue.area / h;
    if (w < 1 || w > board.cols || !shapeOk(clue.shape, h, w)) continue;
    for (let row = Math.max(0, cr - h + 1); row <= cr && row + h <= board.rows; row++) {
      for (let col = Math.max(0, cc - w + 1); col <= cc && col + w <= board.cols; col++) {
        const rect = { row, col, h, w };
        if (rectValid(board, rect, used) == null) out.push(rect);
      }
    }
  }
  return out;
}

export function countPatchesSolutions(board: PatchesBoard, limit: number): number {
  const clues = board.clues.slice();
  let found = 0;

  function search(i: number, used: Set<number>): boolean {
    if (found >= limit) return true;
    if (i === clues.length) {
      if (used.size === board.rows * board.cols) found += 1;
      return found >= limit;
    }
    const clue = clues[i];
    if (used.has(clue.at)) return search(i + 1, used);
    const opts = possibleRects(board, clue, used);
    if (opts.length === 0) return false;
    for (const rect of opts) {
      const next = new Set(used);
      for (const at of rectCells(board, rect)) next.add(at);
      if (search(i + 1, next)) return true;
    }
    return false;
  }

  search(0, new Set());
  return found;
}
