import { describe, expect, it } from "vitest";
import { noopEngine } from "./engine";

describe("noop engine contract", () => {
  it("generate is deterministic for the same seed", () => {
    const a = noopEngine.generate("alpha", "easy", "noop-0");
    const b = noopEngine.generate("alpha", "easy", "noop-0");
    expect(noopEngine.serialize(a)).toBe(noopEngine.serialize(b));
  });

  it("round-trips serialize and deserialize", () => {
    const puzzle = noopEngine.generate("beta", "hard", "noop-0");
    const again = noopEngine.deserialize(noopEngine.serialize(puzzle));
    expect(again.seed).toBe("beta");
    expect(again.difficulty).toBe("hard");
  });
});
