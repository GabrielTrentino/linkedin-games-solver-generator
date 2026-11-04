export const PATCHES_GENERATOR_VERSION = "patches-1";

export type PatchShape = "square" | "tall" | "wide" | "any";

export type PatchClue = {
  at: number;
  area: number;
  shape: PatchShape;
};

export type PatchRect = {
  row: number;
  col: number;
  h: number;
  w: number;
};

export type PatchesBoard = {
  rows: number;
  cols: number;
  clues: PatchClue[];
};

export type PatchesState = {
  rects: PatchRect[];
};

export type PatchesMove =
  | { type: "add"; rect: PatchRect }
  | { type: "remove"; at: number }
  | { type: "clear" };

export function parsePatchesBoard(payload: string): PatchesBoard {
  const board = JSON.parse(payload) as PatchesBoard;
  if (board.rows < 4 || board.cols < 4 || !Array.isArray(board.clues) || board.clues.length === 0) {
    throw new Error("Payload de Patches inválido");
  }
  return board;
}

export function initialPatchesState(): PatchesState {
  return { rects: [] };
}

export function patchesIndex(board: PatchesBoard, row: number, col: number) {
  return row * board.cols + col;
}

export function patchesRow(board: PatchesBoard, at: number) {
  return Math.floor(at / board.cols);
}

export function patchesCol(board: PatchesBoard, at: number) {
  return at % board.cols;
}

export function rectCells(board: PatchesBoard, rect: PatchRect): number[] {
  const cells: number[] = [];
  for (let r = 0; r < rect.h; r++) {
    for (let c = 0; c < rect.w; c++) {
      cells.push(patchesIndex(board, rect.row + r, rect.col + c));
    }
  }
  return cells;
}

export function shapeOf(h: number, w: number): PatchShape {
  if (h === w) return "square";
  return h > w ? "tall" : "wide";
}

export function shapeOk(shape: PatchShape, h: number, w: number) {
  if (shape === "any") return true;
  return shapeOf(h, w) === shape;
}

export function clueAtCell(board: PatchesBoard, at: number) {
  return board.clues.find((c) => c.at === at) ?? null;
}

/** Um retângulo cobre a casa (row, col)? */
export function rectHasCell(board: PatchesBoard, rect: PatchRect, at: number): boolean {
  const row = patchesRow(board, at);
  const col = patchesCol(board, at);
  return row >= rect.row && row < rect.row + rect.h && col >= rect.col && col < rect.col + rect.w;
}

/** Índice da pista dentro do retângulo, ou -1 se ele não cobre nenhuma. */
export function clueIndexIn(board: PatchesBoard, rect: PatchRect): number {
  return board.clues.findIndex((clue) => rectHasCell(board, rect, clue.at));
}
