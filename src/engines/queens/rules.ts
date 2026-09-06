import { chebyshev, colOf, rowOf, type QueensBoard, type QueensCell, type QueensState } from "./model";
import type { RuleViolation } from "../core/types";

type Crown = { at: number; row: number; col: number; region: number };

function crownsOn(board: QueensBoard, state: QueensState): Crown[] {
  const { size, regions } = board;
  const found: Crown[] = [];
  state.cells.forEach((cell, at) => {
    if (cell !== "crown") return;
    found.push({
      at,
      row: rowOf(size, at),
      col: colOf(size, at),
      region: regions[at],
    });
  });
  return found;
}

export function validateQueens(board: QueensBoard, state: QueensState): RuleViolation[] {
  const crowns = crownsOn(board, state);
  const hits = new Set<string>();

  for (let i = 0; i < crowns.length; i++) {
    for (let j = i + 1; j < crowns.length; j++) {
      const a = crowns[i];
      const b = crowns[j];
      if (a.row === b.row) hits.add(`row:${a.row}`);
      if (a.col === b.col) hits.add(`col:${a.col}`);
      if (a.region === b.region) hits.add(`region:${a.region}`);
      if (chebyshev(a.row, a.col, b.row, b.col) === 1) {
        hits.add(`touch:${a.at}:${b.at}`);
      }
    }
  }

  return [...hits].map((code) => ({
    code,
    message: messageFor(code),
  }));
}

function messageFor(code: string) {
  if (code.startsWith("row:")) return "Duas coroas na mesma linha";
  if (code.startsWith("col:")) return "Duas coroas na mesma coluna";
  if (code.startsWith("region:")) return "Duas coroas na mesma região";
  return "Duas coroas se tocam";
}

export function conflictingCells(board: QueensBoard, state: QueensState): Set<number> {
  const crowns = crownsOn(board, state);
  const bad = new Set<number>();
  for (let i = 0; i < crowns.length; i++) {
    for (let j = i + 1; j < crowns.length; j++) {
      const a = crowns[i];
      const b = crowns[j];
      const clash =
        a.row === b.row ||
        a.col === b.col ||
        a.region === b.region ||
        chebyshev(a.row, a.col, b.row, b.col) === 1;
      if (clash) {
        bad.add(a.at);
        bad.add(b.at);
      }
    }
  }
  return bad;
}

export function isQueensSolved(board: QueensBoard, state: QueensState) {
  const crowns = crownsOn(board, state);
  if (crowns.length !== board.size) return false;
  return validateQueens(board, state).length === 0;
}

export function countSolutions(board: QueensBoard, limit = 2): number {
  const { size, regions } = board;
  const colUsed = Array(size).fill(false);
  const regionUsed = Array(size).fill(false);
  const placedCol = Array(size).fill(-1);
  let count = 0;

  function search(row: number) {
    if (count >= limit) return;
    if (row === size) {
      count += 1;
      return;
    }
    for (let col = 0; col < size; col++) {
      if (colUsed[col]) continue;
      const region = regions[row * size + col];
      if (regionUsed[region]) continue;
      if (row > 0 && Math.abs(col - placedCol[row - 1]) <= 1) continue;
      colUsed[col] = true;
      regionUsed[region] = true;
      placedCol[row] = col;
      search(row + 1);
      colUsed[col] = false;
      regionUsed[region] = false;
    }
  }

  search(0);
  return count;
}

export function autoMarkFromCrown(
  board: QueensBoard,
  cells: QueensCell[],
  at: number,
): QueensCell[] {
  const next = cells.slice();
  const { size, regions } = board;
  const row = rowOf(size, at);
  const col = colOf(size, at);
  const region = regions[at];
  for (let i = 0; i < next.length; i++) {
    if (i === at || next[i] !== "empty") continue;
    const r = rowOf(size, i);
    const c = colOf(size, i);
    if (r === row || c === col || regions[i] === region || chebyshev(row, col, r, c) === 1) {
      next[i] = "mark";
    }
  }
  return next;
}
