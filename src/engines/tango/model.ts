export const TANGO_SIZE = 6;
export const TANGO_GENERATOR_VERSION = "tango-1";

export type TangoSym = "sun" | "moon";
export type TangoCell = "empty" | TangoSym;
export type TangoLink = "eq" | "neq";

export type TangoBoard = {
  size: 6;
  givens: Array<TangoSym | null>;
  hLinks: Array<TangoLink | null>;
  vLinks: Array<TangoLink | null>;
};

export type TangoState = {
  cells: TangoCell[];
};

export type TangoMove = {
  at: number;
};

export function opposite(sym: TangoSym): TangoSym {
  return sym === "sun" ? "moon" : "sun";
}

export function cycleTango(cell: TangoCell): TangoCell {
  if (cell === "empty") return "sun";
  if (cell === "sun") return "moon";
  return "empty";
}

export function parseTangoBoard(payload: string): TangoBoard {
  const board = JSON.parse(payload) as TangoBoard;
  if (
    board.size !== TANGO_SIZE ||
    board.givens.length !== 36 ||
    board.hLinks.length !== 30 ||
    board.vLinks.length !== 30
  ) {
    throw new Error("Payload de Tango inválido");
  }
  return board;
}

export function initialTangoState(board: TangoBoard): TangoState {
  return {
    cells: board.givens.map((g) => (g ?? "empty") as TangoCell),
  };
}

export function indexOf(row: number, col: number) {
  return row * TANGO_SIZE + col;
}

export function rowOf(at: number) {
  return Math.floor(at / TANGO_SIZE);
}

export function colOf(at: number) {
  return at % TANGO_SIZE;
}

export function hLinkIndex(row: number, col: number) {
  return row * (TANGO_SIZE - 1) + col;
}

export function vLinkIndex(row: number, col: number) {
  return row * TANGO_SIZE + col;
}
