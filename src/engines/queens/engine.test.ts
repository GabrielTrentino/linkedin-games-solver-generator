import { describe, expect, it } from "vitest";
import { queensEngine } from "./engine";
import { parseBoard, emptyState, type QueensCell } from "./model";
import { countSolutions, isQueensSolved, validateQueens } from "./rules";
import { findSolution } from "./solve";

describe("queens engine", () => {
  it("generate is deterministic for the same seed", () => {
    const a = queensEngine.generate("mesa-azul", "easy", "queens-1");
    const b = queensEngine.generate("mesa-azul", "easy", "queens-1");
    expect(a.payload).toBe(b.payload);
    expect(queensEngine.serialize(a)).toBe(queensEngine.serialize(b));
  });

  it("produces a unique solution on several seeds", () => {
    for (const seed of ["alpha", "beta", "gama", "delta"]) {
      const puzzle = queensEngine.generate(seed, "easy", "queens-1");
      const board = parseBoard(puzzle.payload);
      expect(board.size).toBe(7);
      expect(countSolutions(board, 3)).toBe(1);
    }
  });

  it("marks a complete valid placement as solved", () => {
      const puzzle = queensEngine.generate("resolver-ok", "easy", "queens-1");
    const board = parseBoard(puzzle.payload);
    const cols = findSolution(board);
    expect(cols).not.toBeNull();
    const cells: QueensCell[] = Array(board.size * board.size).fill("empty");
    cols!.forEach((col, row) => {
      cells[row * board.size + col] = "crown";
    });
    const state = { cells };
    expect(validateQueens(board, state)).toEqual([]);
    expect(isQueensSolved(board, state)).toBe(true);
    expect(queensEngine.isSolved(puzzle, state)).toBe(true);
  });

  it("detects adjacent crowns", () => {
    const puzzle = queensEngine.generate("conflito", "easy", "queens-1");
    const board = parseBoard(puzzle.payload);
    const state = emptyState(board.size);
    state.cells[0] = "crown";
    state.cells[1] = "crown";
    const issues = queensEngine.validate(puzzle, state);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("medium boards are 8x8", () => {
    const puzzle = queensEngine.generate("oito-ok", "medium", "queens-1");
    expect(parseBoard(puzzle.payload).size).toBe(8);
  });

  it("hard boards are 9x9 with a unique solution", () => {
    const puzzle = queensEngine.generate("nove-ok", "hard", "queens-1");
    const board = parseBoard(puzzle.payload);
    expect(board.size).toBe(9);
    expect(countSolutions(board, 3)).toBe(1);
  });
});
