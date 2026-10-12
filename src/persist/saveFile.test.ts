import { describe, expect, it } from "vitest";
import { parseSaveFile, validateSaveFile } from "./saveFile";

const puzzle = {
  id: "p1",
  game: "queens",
  seed: "abc",
  difficulty: "easy",
  generatorVersion: "queens-1",
  payload: "{}",
  createdAt: 1,
};

const attempt = {
  id: "a1",
  puzzleId: "p1",
  startedAt: 1,
  finishedAt: 2,
  elapsedMs: 1000,
  hintsUsed: {},
  completed: true,
};

function save(extra: Record<string, unknown> = {}) {
  return {
    meta: { schemaVersion: 1, exportedAt: 5 },
    puzzles: [puzzle],
    attempts: [attempt],
    solutions: [],
    ...extra,
  };
}

describe("validateSaveFile", () => {
  it("aceita um save exportado pelo app", () => {
    const result = validateSaveFile(save());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.save.puzzles).toHaveLength(1);
      expect(result.save.meta.exportedAt).toBe(5);
    }
  });

  it("completa listas opcionais e hintsUsed ausentes", () => {
    const noHints: Record<string, unknown> = { ...attempt };
    delete noHints.hintsUsed;
    const result = validateSaveFile({
      meta: { schemaVersion: 1 },
      puzzles: [],
      attempts: [noHints],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.save.solutions).toEqual([]);
      expect(result.save.attempts[0].hintsUsed).toEqual({});
    }
  });

  it("recusa o que não é objeto", () => {
    expect(validateSaveFile(null).ok).toBe(false);
    expect(validateSaveFile([]).ok).toBe(false);
    expect(validateSaveFile("save").ok).toBe(false);
  });

  it("recusa versão de schema diferente", () => {
    const result = validateSaveFile(save({ meta: { schemaVersion: 2, exportedAt: 1 } }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain("Versão de save 2");
  });

  it("aponta a linha com problema", () => {
    const result = validateSaveFile(save({ puzzles: [puzzle, { ...puzzle, game: "chess" }] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toBe("puzzles[1]: jogo desconhecido (chess).");
  });

  it("recusa tentativa com tempo negativo", () => {
    const result = validateSaveFile(save({ attempts: [{ ...attempt, elapsedMs: -1 }] }));
    expect(result.ok).toBe(false);
  });

  it("limita a quantidade de erros", () => {
    const bad = Array.from({ length: 20 }, () => ({ id: "" }));
    const result = validateSaveFile(save({ puzzles: bad }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.length).toBeLessThanOrEqual(5);
  });
});

describe("parseSaveFile", () => {
  it("transforma JSON quebrado em mensagem legível", () => {
    const result = parseSaveFile("{ isso não é json");
    expect(result).toEqual({ ok: false, errors: ["O arquivo não é um JSON válido."] });
  });
});
