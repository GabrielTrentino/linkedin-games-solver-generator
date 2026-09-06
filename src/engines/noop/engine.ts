import type { Puzzle, PuzzleEngine } from "../core/types";

const GENERATOR_VERSION = "noop-0";

export const noopEngine: PuzzleEngine<Record<string, never>, never> = {
  game: "queens",
  generatorVersion: GENERATOR_VERSION,
  generate(seed, difficulty, generatorVersion) {
    const version = generatorVersion || GENERATOR_VERSION;
    const puzzle: Puzzle = {
      game: "queens",
      seed,
      difficulty,
      generatorVersion: version,
      payload: JSON.stringify({ stub: true, seed, difficulty, version }),
    };
    return puzzle;
  },
  validate() {
    return [];
  },
  isSolved() {
    return false;
  },
  applyMove(state) {
    return state;
  },
  hint() {
    return null;
  },
  serialize(puzzle) {
    return JSON.stringify(puzzle);
  },
  deserialize(payload) {
    return JSON.parse(payload) as Puzzle;
  },
};
