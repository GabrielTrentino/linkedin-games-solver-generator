import { describe, expect, it } from "vitest";
import { tangoEngine } from "./engine";
import { initialTangoState, parseTangoBoard } from "./model";
import { countSolutions, validateTango } from "./rules";

describe("tango engine", () => {
  it("generate is deterministic for the same seed", () => {
    const a = tangoEngine.generate("sol-lua", "easy", "tango-1");
    const b = tangoEngine.generate("sol-lua", "easy", "tango-1");
    expect(a.payload).toBe(b.payload);
  });

  it("produces unique solutions", () => {
    for (const seed of ["alpha", "beta", "gama"]) {
      const puzzle = tangoEngine.generate(seed, "easy", "tango-1");
      const board = parseTangoBoard(puzzle.payload);
      expect(board.size).toBe(6);
      expect(countSolutions(board, 3)).toBe(1);
    }
  });

  it("starts with givens and is not already solved without filling", () => {
    const puzzle = tangoEngine.generate("inicio", "easy", "tango-1");
    const board = parseTangoBoard(puzzle.payload);
    const state = initialTangoState(board);
    const empty = state.cells.filter((c, i) => !board.givens[i] && c === "empty").length;
    expect(empty).toBeGreaterThan(0);
  });

  it("detects three in a row", () => {
    const puzzle = tangoEngine.generate("trio", "easy", "tango-1");
    const board = parseTangoBoard(puzzle.payload);
    const state = initialTangoState(board);
    state.cells = Array(36).fill("empty");
    state.cells[0] = "sun";
    state.cells[1] = "sun";
    state.cells[2] = "sun";
    const issues = validateTango(board, state);
    expect(issues.some((i) => i.code.startsWith("trio"))).toBe(true);
  });
});
