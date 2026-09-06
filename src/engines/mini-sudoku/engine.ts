import type { PuzzleEngine } from "../core/types";
import { generateSudokuBoard } from "./generate";
import {
  SUDOKU_GENERATOR_VERSION,
  parseSudokuBoard,
  type SudokuMove,
  type SudokuState,
} from "./model";
import { isSudokuSolved, validateSudoku } from "./rules";

export const miniSudokuEngine: PuzzleEngine<SudokuState, SudokuMove> = {
  game: "mini-sudoku",
  generatorVersion: SUDOKU_GENERATOR_VERSION,
  generate(seed, difficulty, generatorVersion) {
    const version = generatorVersion || SUDOKU_GENERATOR_VERSION;
    const board = generateSudokuBoard(seed, difficulty, version);
    return {
      game: "mini-sudoku",
      seed,
      difficulty,
      generatorVersion: version,
      payload: JSON.stringify(board),
    };
  },
  validate(puzzle, state) {
    return validateSudoku(parseSudokuBoard(puzzle.payload), state);
  },
  isSolved(puzzle, state) {
    return isSudokuSolved(parseSudokuBoard(puzzle.payload), state);
  },
  applyMove(state, move) {
    const cells = state.cells.slice();
    cells[move.at] = move.value;
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
      game: "mini-sudoku",
      seed: parsed.seed,
      difficulty: parsed.difficulty,
      generatorVersion: parsed.generatorVersion,
      payload: parsed.payload,
    };
  },
};
