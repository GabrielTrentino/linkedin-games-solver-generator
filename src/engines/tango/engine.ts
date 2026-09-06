import type { PuzzleEngine } from "../core/types";
import { generateTangoBoard } from "./generate";
import {
  TANGO_GENERATOR_VERSION,
  cycleTango,
  parseTangoBoard,
  type TangoMove,
  type TangoState,
} from "./model";
import { isTangoSolved, validateTango } from "./rules";

export const tangoEngine: PuzzleEngine<TangoState, TangoMove> = {
  game: "tango",
  generatorVersion: TANGO_GENERATOR_VERSION,
  generate(seed, difficulty, generatorVersion) {
    const version = generatorVersion || TANGO_GENERATOR_VERSION;
    const board = generateTangoBoard(seed, difficulty, version);
    return {
      game: "tango",
      seed,
      difficulty,
      generatorVersion: version,
      payload: JSON.stringify(board),
    };
  },
  validate(puzzle, state) {
    return validateTango(parseTangoBoard(puzzle.payload), state);
  },
  isSolved(puzzle, state) {
    return isTangoSolved(parseTangoBoard(puzzle.payload), state);
  },
  applyMove(state, move) {
    const cells = state.cells.slice();
    cells[move.at] = cycleTango(cells[move.at] ?? "empty");
    return { cells };
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
      game: "tango",
      seed: parsed.seed,
      difficulty: parsed.difficulty,
      generatorVersion: parsed.generatorVersion,
      payload: parsed.payload,
    };
  },
};
