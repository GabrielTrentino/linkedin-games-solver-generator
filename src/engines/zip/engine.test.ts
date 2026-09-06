import { describe, expect, it } from "vitest";
import { zipEngine } from "./engine";
import { parseZipBoard } from "./model";
import { countZipSolutions, isZipSolved } from "./rules";

describe("zip engine", () => {
  it("generate is deterministic for the same seed", () => {
    const a = zipEngine.generate("trilha", "easy", "zip-1");
    const b = zipEngine.generate("trilha", "easy", "zip-1");
    expect(a.payload).toBe(b.payload);
  });

  it("produces unique solutions", () => {
    for (const seed of ["alpha", "beta"]) {
      const puzzle = zipEngine.generate(seed, "easy", "zip-1");
      expect(countZipSolutions(parseZipBoard(puzzle.payload), 3)).toBe(1);
    }
  });

  it("empty path is not solved", () => {
    const puzzle = zipEngine.generate("inicio", "easy", "zip-1");
    expect(isZipSolved(parseZipBoard(puzzle.payload), { path: [] })).toBe(false);
  });
});
