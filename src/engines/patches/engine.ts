import type { PuzzleEngine } from "../core/types";
import { generatePatchesBoard } from "./generate";
import {
  PATCHES_GENERATOR_VERSION,
  initialPatchesState,
  parsePatchesBoard,
  type PatchesMove,
  type PatchesState,
} from "./model";
import { isPatchesSolved, validatePatches } from "./rules";

export const patchesEngine: PuzzleEngine<PatchesState, PatchesMove> = {
  game: "patches",
  generatorVersion: PATCHES_GENERATOR_VERSION,
  generate(seed, difficulty, generatorVersion) {
    const version = generatorVersion || PATCHES_GENERATOR_VERSION;
    const board = generatePatchesBoard(seed, difficulty, version);
    return {
      game: "patches",
      seed,
      difficulty,
      generatorVersion: version,
      payload: JSON.stringify(board),
    };
  },
  validate(puzzle, state) {
    return validatePatches(parsePatchesBoard(puzzle.payload), state);
  },
  isSolved(puzzle, state) {
    return isPatchesSolved(parsePatchesBoard(puzzle.payload), state);
  },
  applyMove(state, move) {
    if (move.type === "clear") return initialPatchesState();
    if (move.type === "remove") {
      return { rects: state.rects.filter((_, i) => i !== move.at) };
    }
    return { rects: [...state.rects, move.rect] };
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
      game: "patches",
      seed: parsed.seed,
      difficulty: parsed.difficulty,
      generatorVersion: parsed.generatorVersion,
      payload: parsed.payload,
    };
  },
};
