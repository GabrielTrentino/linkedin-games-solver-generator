import type { RuleViolation } from "../core/types";
import {
  SUDOKU_BOX_H,
  SUDOKU_BOX_W,
  SUDOKU_SIZE,
  boxOf,
  colOf,
  indexOf,
  rowOf,
  type SudokuBoard,
  type SudokuCell,
  type SudokuState,
} from "./model";

function unitCells(kind: "row" | "col" | "box", id: number): number[] {
  const cells: number[] = [];
  if (kind === "row") {
    for (let col = 0; col < SUDOKU_SIZE; col++) cells.push(indexOf(id, col));
  } else if (kind === "col") {
    for (let row = 0; row < SUDOKU_SIZE; row++) cells.push(indexOf(row, id));
  } else {
    const br = Math.floor(id / 2);
    const bc = id % 2;
    for (let r = 0; r < SUDOKU_BOX_H; r++) {
      for (let c = 0; c < SUDOKU_BOX_W; c++) {
        cells.push(indexOf(br * SUDOKU_BOX_H + r, bc * SUDOKU_BOX_W + c));
      }
    }
  }
  return cells;
}

function duplicates(cells: SudokuCell[], indices: number[]): number[] {
  const seen = new Map<number, number>();
  const bad: number[] = [];
  for (const at of indices) {
    const v = cells[at];
    if (!v) continue;
    const prev = seen.get(v);
    if (prev != null) {
      bad.push(prev, at);
    } else {
      seen.set(v, at);
    }
  }
  return bad;
}

export function conflictingCells(board: SudokuBoard, state: SudokuState): Set<number> {
  void board;
  const bad = new Set<number>();
  for (const kind of ["row", "col", "box"] as const) {
    for (let id = 0; id < SUDOKU_SIZE; id++) {
      for (const at of duplicates(state.cells, unitCells(kind, id))) bad.add(at);
    }
  }
  return bad;
}

export function validateSudoku(board: SudokuBoard, state: SudokuState): RuleViolation[] {
  const issues: RuleViolation[] = [];
  if (conflictingCells(board, state).size > 0) {
    issues.push({ code: "repeat", message: "Há dígito repetido na linha, coluna ou caixa." });
  }
  return issues;
}

export function isSudokuSolved(board: SudokuBoard, state: SudokuState): boolean {
  if (state.cells.some((c, i) => board.givens[i] && c !== board.givens[i])) return false;
  if (state.cells.some((c) => c === 0)) return false;
  return conflictingCells(board, state).size === 0;
}

export function canPlace(cells: SudokuCell[], at: number, value: number): boolean {
  const row = rowOf(at);
  const col = colOf(at);
  const box = boxOf(at);
  for (let i = 0; i < 36; i++) {
    if (i === at || cells[i] !== value) continue;
    if (rowOf(i) === row || colOf(i) === col || boxOf(i) === box) return false;
  }
  return true;
}

export function countSolutions(board: SudokuBoard, limit: number): number {
  const cells = board.givens.slice() as SudokuCell[];
  const empties: number[] = [];
  for (let i = 0; i < 36; i++) if (!cells[i]) empties.push(i);
  let found = 0;

  function search(): boolean {
    if (found >= limit) return true;
    let best = -1;
    let bestOpts: number[] = [];
    for (const at of empties) {
      if (cells[at]) continue;
      const opts: number[] = [];
      for (let d = 1; d <= 6; d++) if (canPlace(cells, at, d)) opts.push(d);
      if (opts.length === 0) return false;
      if (best === -1 || opts.length < bestOpts.length) {
        best = at;
        bestOpts = opts;
        if (opts.length === 1) break;
      }
    }
    if (best === -1) {
      found += 1;
      return found >= limit;
    }
    for (const d of bestOpts) {
      cells[best] = d as SudokuCell;
      if (search()) return true;
      cells[best] = 0;
    }
    return false;
  }

  search();
  return found;
}
