export type QueensCell = "empty" | "mark" | "crown";

export type QueensBoard = {
  size: number;
  regions: number[];
};

export type QueensState = {
  cells: QueensCell[];
};

export type QueensMove = {
  at: number;
};

export const QUEENS_GENERATOR_VERSION = "queens-1";

export function emptyState(size: number): QueensState {
  return { cells: Array.from({ length: size * size }, () => "empty") };
}

export function parseBoard(payload: string): QueensBoard {
  const board = JSON.parse(payload) as QueensBoard;
  if (!board.size || board.regions.length !== board.size * board.size) {
    throw new Error("Payload de Queens inválido");
  }
  return board;
}

export function indexOf(size: number, row: number, col: number) {
  return row * size + col;
}

export function rowOf(size: number, at: number) {
  return Math.floor(at / size);
}

export function colOf(size: number, at: number) {
  return at % size;
}

export function chebyshev(aRow: number, aCol: number, bRow: number, bCol: number) {
  return Math.max(Math.abs(aRow - bRow), Math.abs(aCol - bCol));
}

export function cycleCell(cell: QueensCell): QueensCell {
  if (cell === "empty") return "mark";
  if (cell === "mark") return "crown";
  return "empty";
}

export const REGION_COLORS = [
  "#8bb7d9",
  "#d4a574",
  "#8bb89a",
  "#d49aa0",
  "#b7a3d4",
  "#e0c56e",
  "#7eb8b2",
  "#c9a07b",
  "#9ab0d4",
  "#c4c98a",
];
