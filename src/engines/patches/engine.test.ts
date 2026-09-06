import { describe, expect, it } from "vitest";
import { patchesEngine } from "./engine";
import { parsePatchesBoard } from "./model";
import { countPatchesSolutions, isPatchesSolved } from "./rules";

describe("patches engine", () => {
  it("generate is deterministic for the same seed", () => {
    const a = patchesEngine.generate("retalho", "easy", "patches-1");
    const b = patchesEngine.generate("retalho", "easy", "patches-1");
    expect(a.payload).toBe(b.payload);
  });

  it("produces unique solutions", () => {
    for (const seed of ["alpha", "beta"]) {
      const puzzle = patchesEngine.generate(seed, "easy", "patches-1");
      expect(countPatchesSolutions(parsePatchesBoard(puzzle.payload), 3)).toBe(1);
    }
  });

  it("empty board is not solved", () => {
    const puzzle = patchesEngine.generate("inicio", "easy", "patches-1");
    expect(isPatchesSolved(parsePatchesBoard(puzzle.payload), { rects: [] })).toBe(false);
  });
});
