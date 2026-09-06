import { describe, expect, it } from "vitest";
import { miniSudokuEngine } from "./engine";
import { initialSudokuState, parseSudokuBoard } from "./model";
import { countSolutions, validateSudoku } from "./rules";

describe("mini sudoku engine", () => {
  it("generate is deterministic for the same seed", () => {
    const a = miniSudokuEngine.generate("caixa", "easy", "mini-sudoku-1");
    const b = miniSudokuEngine.generate("caixa", "easy", "mini-sudoku-1");
    expect(a.payload).toBe(b.payload);
  });

  it("produces unique solutions", () => {
    for (const seed of ["alpha", "beta", "gama"]) {
      const puzzle = miniSudokuEngine.generate(seed, "easy", "mini-sudoku-1");
      const board = parseSudokuBoard(puzzle.payload);
      expect(countSolutions(board, 3)).toBe(1);
    }
  });

  it("starts with holes", () => {
    const puzzle = miniSudokuEngine.generate("inicio", "easy", "mini-sudoku-1");
    const board = parseSudokuBoard(puzzle.payload);
    expect(board.givens.filter((g) => g === 0).length).toBeGreaterThan(0);
  });

  it("detects repeats", () => {
    const puzzle = miniSudokuEngine.generate("eco", "easy", "mini-sudoku-1");
    const board = parseSudokuBoard(puzzle.payload);
    const state = initialSudokuState(board);
    state.cells = Array(36).fill(1);
    const issues = validateSudoku(board, state);
    expect(issues.some((i) => i.code === "repeat")).toBe(true);
  });
});
