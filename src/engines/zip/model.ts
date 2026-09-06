export const ZIP_GENERATOR_VERSION = "zip-1";

export type ZipBoard = {
  size: number;
  numbers: Array<number | null>;
  hWalls: boolean[];
  vWalls: boolean[];
};

export type ZipState = {
  path: number[];
};

export type ZipMove =
  | { type: "set"; path: number[] }
  | { type: "clear" };

export function parseZipBoard(payload: string): ZipBoard {
  const board = JSON.parse(payload) as ZipBoard;
  const n = board.size;
  if (n < 4 || n > 9 || board.numbers.length !== n * n) {
    throw new Error("Payload de Zip inválido");
  }
  if (board.hWalls.length !== n * (n - 1) || board.vWalls.length !== (n - 1) * n) {
    throw new Error("Payload de Zip inválido");
  }
  return board;
}

export function initialZipState(): ZipState {
  return { path: [] };
}

export function zipIndex(size: number, row: number, col: number) {
  return row * size + col;
}

export function zipRow(size: number, at: number) {
  return Math.floor(at / size);
}

export function zipCol(size: number, at: number) {
  return at % size;
}

export function hWallIndex(size: number, row: number, col: number) {
  return row * (size - 1) + col;
}

export function vWallIndex(size: number, row: number, col: number) {
  return row * size + col;
}

export function hasWall(board: ZipBoard, a: number, b: number): boolean {
  const size = board.size;
  const ra = zipRow(size, a);
  const ca = zipCol(size, a);
  const rb = zipRow(size, b);
  const cb = zipCol(size, b);
  if (ra === rb && Math.abs(ca - cb) === 1) {
    return board.hWalls[hWallIndex(size, ra, Math.min(ca, cb))];
  }
  if (ca === cb && Math.abs(ra - rb) === 1) {
    return board.vWalls[vWallIndex(size, Math.min(ra, rb), ca)];
  }
  return true;
}

export function zipNeighbors(board: ZipBoard, at: number): number[] {
  const size = board.size;
  const r = zipRow(size, at);
  const c = zipCol(size, at);
  const out: number[] = [];
  const tryAdd = (rr: number, cc: number) => {
    if (rr < 0 || cc < 0 || rr >= size || cc >= size) return;
    const nb = zipIndex(size, rr, cc);
    if (!hasWall(board, at, nb)) out.push(nb);
  };
  tryAdd(r - 1, c);
  tryAdd(r + 1, c);
  tryAdd(r, c - 1);
  tryAdd(r, c + 1);
  return out;
}

export function maxZipNumber(board: ZipBoard): number {
  let m = 0;
  for (const n of board.numbers) if (n != null && n > m) m = n;
  return m;
}

export function startCell(board: ZipBoard): number {
  const at = board.numbers.findIndex((n) => n === 1);
  if (at < 0) throw new Error("Zip sem o número 1");
  return at;
}
