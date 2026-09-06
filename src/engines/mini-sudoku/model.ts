export const SUDOKU_SIZE = 6;
export const SUDOKU_BOX_H = 2;
export const SUDOKU_BOX_W = 3;
export const SUDOKU_GENERATOR_VERSION = "mini-sudoku-1";

export type SudokuDigit = 1 | 2 | 3 | 4 | 5 | 6;
export type SudokuCell = 0 | SudokuDigit;

export type SudokuBoard = {
  size: 6;
  givens: SudokuCell[];
};

export type SudokuState = {
  cells: SudokuCell[];
};

export type SudokuMove = {
  at: number;
  value: SudokuCell;
};

export function parseSudokuBoard(payload: string): SudokuBoard {
  const board = JSON.parse(payload) as SudokuBoard;
  if (board.size !== SUDOKU_SIZE || board.givens.length !== 36) {
    throw new Error("Payload de Mini Sudoku inválido");
  }
  return board;
}

export function initialSudokuState(board: SudokuBoard): SudokuState {
  return { cells: board.givens.slice() };
}

export function indexOf(row: number, col: number) {
  return row * SUDOKU_SIZE + col;
}

export function rowOf(at: number) {
  return Math.floor(at / SUDOKU_SIZE);
}

export function colOf(at: number) {
  return at % SUDOKU_SIZE;
}

export function boxOf(at: number) {
  const row = rowOf(at);
  const col = colOf(at);
  return Math.floor(row / SUDOKU_BOX_H) * (SUDOKU_SIZE / SUDOKU_BOX_W) + Math.floor(col / SUDOKU_BOX_W);
}
