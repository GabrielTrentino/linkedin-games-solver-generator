import type { PuzzleEngine } from "../core/types";
import { generateZipBoard } from "./generate";
import {
  ZIP_GENERATOR_VERSION,
  initialZipState,
  parseZipBoard,
  type ZipMove,
  type ZipState,
} from "./model";
import { isZipSolved, validateZip } from "./rules";

export const zipEngine: PuzzleEngine<ZipState, ZipMove> = {
  game: "zip",
  generatorVersion: ZIP_GENERATOR_VERSION,
  generate(seed, difficulty, generatorVersion) {
    const version = generatorVersion || ZIP_GENERATOR_VERSION;
    const board = generateZipBoard(seed, difficulty, version);
    return {
      game: "zip",
      seed,
      difficulty,
      generatorVersion: version,
      payload: JSON.stringify(board),
    };
  },
  validate(puzzle, state) {
    return validateZip(parseZipBoard(puzzle.payload), state);
  },
  isSolved(puzzle, state) {
    return isZipSolved(parseZipBoard(puzzle.payload), state);
  },
  applyMove(state, move) {
    if (move.type === "clear") return initialZipState();
    return { path: move.path.slice() };
  },
  hint() {
    return null;
  },
  serialize(puzzle) {
    return JSON.stringify({
      seed: puzzle.seed,
      difficulty: puzzle.difficulty,
      generatorVersion: puzzle.generatorVersion,
      payload: puzzle.payload,
    });
  },
  deserialize(payload) {
    const parsed = JSON.parse(payload) as {
      seed: string;
      difficulty: "easy" | "medium" | "hard";
      generatorVersion: string;
      payload: string;
    };
    return {
      game: "zip",
      seed: parsed.seed,
      difficulty: parsed.difficulty,
      generatorVersion: parsed.generatorVersion,
      payload: parsed.payload,
    };
  },
};
