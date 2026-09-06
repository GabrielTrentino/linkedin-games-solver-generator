import type { QueensBoard } from "./model";

export function findSolution(board: QueensBoard): number[] | null {
  const { size, regions } = board;
  const colUsed = Array(size).fill(false);
  const regionUsed = Array(size).fill(false);
  const placedCol = Array(size).fill(-1);
  let found: number[] | null = null;

  function search(row: number) {
    if (found) return;
    if (row === size) {
      found = placedCol.slice();
      return;
    }
    for (let col = 0; col < size; col++) {
      if (colUsed[col]) continue;
      const region = regions[row * size + col];
      if (regionUsed[region]) continue;
      if (row > 0 && Math.abs(col - placedCol[row - 1]) <= 1) continue;
      colUsed[col] = true;
      regionUsed[region] = true;
      placedCol[row] = col;
      search(row + 1);
      colUsed[col] = false;
      regionUsed[region] = false;
    }
  }

  search(0);
  return found;
}
