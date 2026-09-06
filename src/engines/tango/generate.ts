import { rngFromString, shuffle, type Rng } from "../core/rng";
import type { Difficulty } from "../core/types";
import {
  TANGO_GENERATOR_VERSION,
  TANGO_SIZE,
  hLinkIndex,
  indexOf,
  vLinkIndex,
  type TangoBoard,
  type TangoLink,
  type TangoSym,
} from "./model";
import { countSolutions, partialOk } from "./rules";

const TARGET: Record<Difficulty, { links: number; givens: number }> = {
  easy: { links: 8, givens: 12 },
  medium: { links: 10, givens: 8 },
  hard: { links: 12, givens: 6 },
};

export function generateTangoBoard(
  seed: string,
  difficulty: Difficulty,
  generatorVersion = TANGO_GENERATOR_VERSION,
): TangoBoard {
  const rng = rngFromString(`${generatorVersion}|${difficulty}|${seed}`);
  const target = TARGET[difficulty];

  for (let attempt = 0; attempt < 80; attempt++) {
    const filled = fillGrid(rng);
    if (!filled) continue;
    const board = carve(filled, rng, target.links, target.givens);
    if (countSolutions(board, 2) === 1) return board;
  }

  throw new Error("Não foi possível gerar um Tango com solução única. Tente outro seed.");
}

function fillGrid(rng: Rng): TangoSym[] | null {
  const emptyBoard: TangoBoard = {
    size: 6,
    givens: Array(36).fill(null),
    hLinks: Array(30).fill(null),
    vLinks: Array(30).fill(null),
  };
  const cells: Array<TangoSym | null> = Array(36).fill(null);

  function search(i: number): boolean {
    if (i === 36) return true;
    const values = shuffle(["sun", "moon"] as TangoSym[], rng);
    for (const v of values) {
      cells[i] = v;
      if (partialOk(cells, emptyBoard, i) && search(i + 1)) return true;
    }
    cells[i] = null;
    return false;
  }

  return search(0) ? (cells as TangoSym[]) : null;
}

function carve(
  filled: TangoSym[],
  rng: Rng,
  linkCount: number,
  givenCount: number,
): TangoBoard {
  const hLinks: Array<TangoLink | null> = Array(30).fill(null);
  const vLinks: Array<TangoLink | null> = Array(30).fill(null);
  const pairs: Array<{ kind: "h" | "v"; row: number; col: number }> = [];
  for (let row = 0; row < TANGO_SIZE; row++) {
    for (let col = 0; col < TANGO_SIZE - 1; col++) {
      pairs.push({ kind: "h", row, col });
    }
  }
  for (let row = 0; row < TANGO_SIZE - 1; row++) {
    for (let col = 0; col < TANGO_SIZE; col++) {
      pairs.push({ kind: "v", row, col });
    }
  }

  for (const pair of shuffle(pairs, rng).slice(0, linkCount)) {
    if (pair.kind === "h") {
      const a = filled[indexOf(pair.row, pair.col)];
      const b = filled[indexOf(pair.row, pair.col + 1)];
      hLinks[hLinkIndex(pair.row, pair.col)] = a === b ? "eq" : "neq";
    } else {
      const a = filled[indexOf(pair.row, pair.col)];
      const b = filled[indexOf(pair.row + 1, pair.col)];
      vLinks[vLinkIndex(pair.row, pair.col)] = a === b ? "eq" : "neq";
    }
  }

  const givens: Array<TangoSym | null> = filled.slice();
  const order = shuffle(
    Array.from({ length: 36 }, (_, i) => i),
    rng,
  );
  for (const at of order) {
    const kept = givens.filter((g) => g != null).length;
    if (kept <= givenCount) break;
    const backup = givens[at];
    givens[at] = null;
    const board: TangoBoard = { size: 6, givens, hLinks, vLinks };
    if (countSolutions(board, 2) !== 1) givens[at] = backup;
  }

  return { size: 6, givens, hLinks, vLinks };
}
