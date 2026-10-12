import { GAMES, type Difficulty, type GameId, type HintLevel } from "../engines/core/types";

// Tipos das linhas gravadas no IndexedDB e do arquivo de save exportado.
// Ficam aqui (sem Dexie) para a validação ser testável em Node.

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

export const SAVE_SCHEMA_VERSION = 1;

export type SaveFile = {
  meta: { schemaVersion: typeof SAVE_SCHEMA_VERSION; exportedAt: number };
  puzzles: PuzzleRow[];
  attempts: AttemptRow[];
  solutions: SolutionRow[];
};

export type SaveValidation =
  | { ok: true; save: SaveFile }
  | { ok: false; errors: string[] };

const GAME_IDS = new Set<string>(GAMES.map((g) => g.id));
const DIFFICULTIES = new Set<string>(["easy", "medium", "hard"]);
const MAX_ERRORS = 5;

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStr(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNum(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function checkPuzzle(row: unknown): string | null {
  if (!isObj(row)) return "não é um objeto";
  if (!isStr(row.id)) return "sem `id`";
  if (!isStr(row.game) || !GAME_IDS.has(row.game)) return `jogo desconhecido (${String(row.game)})`;
  if (typeof row.seed !== "string") return "sem `seed`";
  if (!isStr(row.difficulty) || !DIFFICULTIES.has(row.difficulty)) return "dificuldade inválida";
  if (!isStr(row.generatorVersion)) return "sem `generatorVersion`";
  if (typeof row.payload !== "string") return "sem `payload`";
  if (!isNum(row.createdAt)) return "sem `createdAt`";
  return null;
}

function checkAttempt(row: unknown): string | null {
  if (!isObj(row)) return "não é um objeto";
  if (!isStr(row.id)) return "sem `id`";
  if (!isStr(row.puzzleId)) return "sem `puzzleId`";
  if (!isNum(row.startedAt)) return "sem `startedAt`";
  if (row.finishedAt !== undefined && !isNum(row.finishedAt)) return "`finishedAt` inválido";
  if (!isNum(row.elapsedMs) || row.elapsedMs < 0) return "`elapsedMs` inválido";
  if (typeof row.completed !== "boolean") return "`completed` inválido";
  if (row.hintsUsed !== undefined && !isObj(row.hintsUsed)) return "`hintsUsed` inválido";
  if (row.finalState !== undefined && typeof row.finalState !== "string") return "`finalState` inválido";
  return null;
}

function checkSolution(row: unknown): string | null {
  if (!isObj(row)) return "não é um objeto";
  if (!isStr(row.id)) return "sem `id`";
  if (!isStr(row.puzzleId)) return "sem `puzzleId`";
  if (!isNum(row.createdAt)) return "sem `createdAt`";
  if (row.source !== "player" && row.source !== "walkthrough") return "`source` inválido";
  if (!Array.isArray(row.steps)) return "`steps` inválido";
  return null;
}

function checkList(
  value: unknown,
  name: string,
  check: (row: unknown) => string | null,
  errors: string[],
) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`\`${name}\` não é uma lista.`);
    return;
  }
  value.forEach((row, i) => {
    if (errors.length >= MAX_ERRORS) return;
    const problem = check(row);
    if (problem) errors.push(`${name}[${i}]: ${problem}.`);
  });
}

/**
 * Valida um JSON importado antes de qualquer gravação no IndexedDB.
 * Aceita `attempts` e `solutions` ausentes (vira lista vazia) e completa
 * `hintsUsed` ausente com `{}`.
 */
export function validateSaveFile(input: unknown): SaveValidation {
  if (!isObj(input)) return { ok: false, errors: ["O arquivo não é um save: esperado um objeto JSON."] };

  const errors: string[] = [];
  const meta = input.meta;
  if (!isObj(meta)) {
    errors.push("Falta o bloco `meta`.");
  } else if (meta.schemaVersion !== SAVE_SCHEMA_VERSION) {
    const found = meta.schemaVersion === undefined ? "ausente" : String(meta.schemaVersion);
    errors.push(
      `Versão de save ${found} não suportada (este app lê a versão ${SAVE_SCHEMA_VERSION}).`,
    );
  }

  if (!Array.isArray(input.puzzles)) errors.push("Falta a lista `puzzles`.");
  checkList(input.puzzles, "puzzles", checkPuzzle, errors);
  checkList(input.attempts, "attempts", checkAttempt, errors);
  checkList(input.solutions, "solutions", checkSolution, errors);

  if (errors.length > 0) return { ok: false, errors };

  const attempts = ((input.attempts as AttemptRow[] | undefined) ?? []).map((row) => ({
    ...row,
    hintsUsed: row.hintsUsed ?? {},
  }));

  return {
    ok: true,
    save: {
      meta: {
        schemaVersion: SAVE_SCHEMA_VERSION,
        exportedAt: isNum((meta as Obj).exportedAt) ? ((meta as Obj).exportedAt as number) : 0,
      },
      puzzles: input.puzzles as PuzzleRow[],
      attempts,
      solutions: (input.solutions as SolutionRow[] | undefined) ?? [],
    },
  };
}

/** Lê o texto de um arquivo e valida. Erros de JSON viram mensagem legível. */
export function parseSaveFile(text: string): SaveValidation {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, errors: ["O arquivo não é um JSON válido."] };
  }
  return validateSaveFile(data);
}
