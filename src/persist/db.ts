import Dexie, { type Table } from "dexie";
import type { GameId } from "../engines/core/types";
import type { AttemptRow, PuzzleRow, SaveFile, SolutionRow } from "./saveFile";

export type { AttemptRow, PuzzleRow, SaveFile, SolutionRow } from "./saveFile";

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

export async function finishAttempt(
  id: string,
  data: { elapsedMs: number; completed: boolean; finalState?: string },
) {
  await db.attempts.update(id, {
    finishedAt: Date.now(),
    elapsedMs: data.elapsedMs,
    completed: data.completed,
    finalState: data.finalState,
  });
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

export async function deleteSave(games: GameId[] | "all") {
  if (games === "all") {
    await db.transaction("rw", db.puzzles, db.attempts, db.solutions, async () => {
      await db.puzzles.clear();
      await db.attempts.clear();
      await db.solutions.clear();
    });
    return;
  }

  const selected = new Set(games);
  if (selected.size === 0) return;

  await db.transaction("rw", db.puzzles, db.attempts, db.solutions, async () => {
    const puzzles = await db.puzzles.toArray();
    const ids = puzzles.filter((p) => selected.has(p.game)).map((p) => p.id);
    if (ids.length === 0) return;
    const attemptIds = await db.attempts.where("puzzleId").anyOf(ids).primaryKeys();
    const solutionIds = await db.solutions.where("puzzleId").anyOf(ids).primaryKeys();
    await db.puzzles.bulkDelete(ids);
    await db.attempts.bulkDelete(attemptIds);
    await db.solutions.bulkDelete(solutionIds);
  });
}

export async function importSave(file: SaveFile, mode: "merge" | "replace") {
  // Tudo numa transação: se uma gravação falhar, nada é apagado nem gravado
  // pela metade (antes o modo "replace" limpava as tabelas fora da transação).
  await db.transaction("rw", db.puzzles, db.attempts, db.solutions, async () => {
    if (mode === "replace") {
      await db.puzzles.clear();
      await db.attempts.clear();
      await db.solutions.clear();
      await db.puzzles.bulkPut(file.puzzles);
      await db.attempts.bulkPut(file.attempts);
      await db.solutions.bulkPut(file.solutions);
      return;
    }
    const [puzzleKeys, attemptKeys, solutionKeys] = await Promise.all([
      db.puzzles.toCollection().primaryKeys(),
      db.attempts.toCollection().primaryKeys(),
      db.solutions.toCollection().primaryKeys(),
    ]);
    const has = (keys: string[]) => {
      const set = new Set(keys);
      return (row: { id: string }) => !set.has(row.id);
    };
    await db.puzzles.bulkPut(file.puzzles.filter(has(puzzleKeys)));
    await db.attempts.bulkPut(file.attempts.filter(has(attemptKeys)));
    await db.solutions.bulkPut(file.solutions.filter(has(solutionKeys)));
  });
}

export type StorageStatus = { ok: true } | { ok: false; reason: string };

/**
 * Abre o IndexedDB uma vez para saber se o navegador permite gravar.
 * Falha em modo privado de alguns navegadores e com armazenamento bloqueado.
 */
export async function checkStorage(): Promise<StorageStatus> {
  if (typeof indexedDB === "undefined") {
    return { ok: false, reason: "Este navegador não oferece IndexedDB." };
  }
  try {
    await db.open();
    return { ok: true };
  } catch (error) {
    const detail = error instanceof Error && error.message ? ` (${error.message})` : "";
    return {
      ok: false,
      reason: `O navegador bloqueou o armazenamento local${detail}.`,
    };
  }
}
