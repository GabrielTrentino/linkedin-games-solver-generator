export type GameId = "queens" | "tango" | "zip" | "mini-sudoku" | "patches";

export type Difficulty = "easy" | "medium" | "hard";

export type HintLevel = 1 | 2 | 3 | 4 | 5;

export type Puzzle = {
  game: GameId;
  seed: string;
  difficulty: Difficulty;
  generatorVersion: string;
  payload: string;
};

export type RuleViolation = {
  code: string;
  message: string;
};

export type Hint = {
  level: HintLevel;
  techniqueId?: string;
  label?: string;
  explanation?: string;
  cells?: Array<{ row: number; col: number }>;
  move?: unknown;
  steps?: Hint[];
};

export type PuzzleEngine<State = unknown, Move = unknown> = {
  game: GameId;
  generatorVersion: string;
  generate: (
    seed: string,
    difficulty: Difficulty,
    generatorVersion: string,
  ) => Puzzle;
  validate: (puzzle: Puzzle, state: State) => RuleViolation[];
  isSolved: (puzzle: Puzzle, state: State) => boolean;
  applyMove: (state: State, move: Move) => State;
  hint: (puzzle: Puzzle, state: State, level: HintLevel) => Hint | null;
  serialize: (puzzle: Puzzle) => string;
  deserialize: (payload: string) => Puzzle;
};

export const GAMES: Array<{
  id: GameId;
  name: string;
  blurb: string;
  ready: boolean;
}> = [
  { id: "queens", name: "Queens", blurb: "Uma coroa por linha, coluna e região.", ready: true },
  { id: "tango", name: "Tango", blurb: "Sóis e luas, três a três, sem trios.", ready: true },
  { id: "mini-sudoku", name: "Mini Sudoku", blurb: "Seis por seis, dígitos 1 a 6.", ready: true },
  { id: "zip", name: "Zip", blurb: "Um caminho que cobre a grade inteira.", ready: true },
  { id: "patches", name: "Patches", blurb: "Retângulos que fecham o tabuleiro.", ready: false },
];

export function isGameId(value: string | undefined): value is GameId {
  return GAMES.some((game) => game.id === value);
}

export const DIFFICULTIES: Array<{ id: Difficulty; name: string }> = [
  { id: "easy", name: "Fácil" },
  { id: "medium", name: "Médio" },
  { id: "hard", name: "Difícil" },
];
