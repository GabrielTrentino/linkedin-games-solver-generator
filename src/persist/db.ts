import Dexie, { type Table } from "dexie";
import type { Difficulty, GameId, HintLevel } from "../engines/core/types";

export type PuzzleRow = {
  id: string;
  game: GameId;
  seed: string;
  difficulty: Difficulty;
  generatorVersion: string;
  payload: string;
  createdAt: number;
};

export type AttemptRow = {
  id: string;
  puzzleId: string;
  startedAt: number;
  finishedAt?: number;
  elapsedMs: number;
  hintsUsed: Partial<Record<HintLevel, number>>;
  completed: boolean;
  finalState?: string;
};

export type SolutionRow = {
  id: string;
  puzzleId: string;
  createdAt: number;
  source: "player" | "walkthrough";
  steps: unknown[];
};

export type SaveFile = {
  meta: { schemaVersion: 1; exportedAt: number };
  puzzles: PuzzleRow[];
  attempts: AttemptRow[];
  solutions: SolutionRow[];
};

class PuzzleDb extends Dexie {
  puzzles!: Table<PuzzleRow, string>;
  attempts!: Table<AttemptRow, string>;
  solutions!: Table<SolutionRow, string>;

  constructor() {
    super("oficina-logica");
    this.version(1).stores({
      puzzles: "id, game, createdAt",
      attempts: "id, puzzleId, completed, startedAt",
      solutions: "id, puzzleId, createdAt",
    });
  }
}

export const db = new PuzzleDb();

export async function savePuzzle(row: PuzzleRow) {
  await db.puzzles.put(row);
}

export async function getPuzzle(id: string) {
  return db.puzzles.get(id);
}

export async function listPuzzles() {
  return db.puzzles.orderBy("createdAt").reverse().toArray();
}

export async function startAttempt(puzzleId: string) {
  const row: AttemptRow = {
    id: crypto.randomUUID(),
    puzzleId,
    startedAt: Date.now(),
    elapsedMs: 0,
    hintsUsed: {},
    completed: false,
  };
  await db.attempts.add(row);
  return row;
}

export async function listAttempts() {
  return db.attempts.orderBy("startedAt").reverse().toArray();
}

export async function exportSave(): Promise<SaveFile> {
  const [puzzles, attempts, solutions] = await Promise.all([
    db.puzzles.toArray(),
    db.attempts.toArray(),
    db.solutions.toArray(),
  ]);
  return {
    meta: { schemaVersion: 1, exportedAt: Date.now() },
    puzzles,
    attempts,
    solutions,
  };
}

export async function importSave(file: SaveFile, mode: "merge" | "replace") {
  if (mode === "replace") {
    await db.puzzles.clear();
    await db.attempts.clear();
    await db.solutions.clear();
  }
  await db.transaction("rw", db.puzzles, db.attempts, db.solutions, async () => {
    for (const row of file.puzzles) {
      const exists = await db.puzzles.get(row.id);
      if (!exists || mode === "replace") await db.puzzles.put(row);
    }
    for (const row of file.attempts) {
      const exists = await db.attempts.get(row.id);
      if (!exists || mode === "replace") await db.attempts.put(row);
    }
    for (const row of file.solutions) {
      const exists = await db.solutions.get(row.id);
      if (!exists || mode === "replace") await db.solutions.put(row);
    }
  });
}
