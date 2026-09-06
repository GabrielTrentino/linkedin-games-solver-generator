import type { PuzzleEngine } from "../core/types";
import { generateQueensBoard } from "./generate";
import {
  QUEENS_GENERATOR_VERSION,
  cycleCell,
  parseBoard,
  type QueensMove,
  type QueensState,
} from "./model";
import { isQueensSolved, validateQueens } from "./rules";

export const queensEngine: PuzzleEngine<QueensState, QueensMove> = {
  game: "queens",
  generatorVersion: QUEENS_GENERATOR_VERSION,
  generate(seed, difficulty, generatorVersion) {
    const version = generatorVersion || QUEENS_GENERATOR_VERSION;
    const board = generateQueensBoard(seed, difficulty, version);
    return {
      game: "queens",
      seed,
      difficulty,
      generatorVersion: version,
      payload: JSON.stringify(board),
    };
  },
  validate(puzzle, state) {
    return validateQueens(parseBoard(puzzle.payload), state);
  },
  isSolved(puzzle, state) {
    return isQueensSolved(parseBoard(puzzle.payload), state);
  },
  applyMove(state, move) {
    const cells = state.cells.slice();
    cells[move.at] = cycleCell(cells[move.at] ?? "empty");
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
      game: "queens",
      seed: parsed.seed,
      difficulty: parsed.difficulty,
      generatorVersion: parsed.generatorVersion,
      payload: parsed.payload,
    };
  },
};

