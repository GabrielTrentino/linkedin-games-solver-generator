import type { RuleViolation } from "../core/types";
import {
  hasWall,
  maxZipNumber,
  startCell,
  zipNeighbors,
  type ZipBoard,
  type ZipState,
} from "./model";

export function pathIssues(board: ZipBoard, path: number[]): RuleViolation[] {
  const issues: RuleViolation[] = [];
  if (path.length === 0) return issues;
  const start = startCell(board);
  if (path[0] !== start) issues.push({ code: "start", message: "O caminho começa no 1." });
  const seen = new Set<number>();
  let next = 1;
  const lastNum = maxZipNumber(board);
  for (let i = 0; i < path.length; i++) {
    const at = path[i];
    if (seen.has(at)) {
      issues.push({ code: "revisit", message: "O caminho não pode repetir casa." });
      break;
    }
    seen.add(at);
    if (i > 0 && hasWall(board, path[i - 1], at)) {
      issues.push({ code: "wall", message: "O caminho atravessa uma parede." });
    }
    const num = board.numbers[at];
    if (num != null) {
      if (num !== next) issues.push({ code: "order", message: "Os números precisam ser visitados em ordem." });
      else next = num + 1;
    }
  }
  if (path.length === board.size * board.size && next !== lastNum + 1) {
    issues.push({ code: "end", message: "O caminho precisa cobrir os números até o último." });
  }
  return issues;
}

export function validateZip(board: ZipBoard, state: ZipState): RuleViolation[] {
  return pathIssues(board, state.path);
}

export function isZipSolved(board: ZipBoard, state: ZipState): boolean {
  const n = board.size * board.size;
  if (state.path.length !== n) return false;
  return pathIssues(board, state.path).length === 0;
}

export function conflictingCells(board: ZipBoard, state: ZipState): Set<number> {
  const bad = new Set<number>();
  const issues = pathIssues(board, state.path);
  if (issues.length === 0 || state.path.length === 0) return bad;
  bad.add(state.path[state.path.length - 1]);
  return bad;
}

function manhattan(size: number, a: number, b: number) {
  const ra = Math.floor(a / size);
  const ca = a % size;
  const rb = Math.floor(b / size);
  const cb = b % size;
  return Math.abs(ra - rb) + Math.abs(ca - cb);
}

export function countZipSolutions(board: ZipBoard, limit: number): number {
  const n = board.size * board.size;
  const start = startCell(board);
  const lastNum = maxZipNumber(board);
  const pos: number[] = [];
  for (let k = 1; k <= lastNum; k++) {
    const at = board.numbers.indexOf(k);
    if (at < 0) return 0;
    pos[k] = at;
  }
  const vis = new Uint8Array(n);
  let found = 0;

  function connected(at: number, visitedCount: number): boolean {
    const remain = n - visitedCount;
    if (remain === 0) return true;
    const q = [at];
    const seen = new Uint8Array(n);
    seen[at] = 1;
    let reach = 1;
    for (let i = 0; i < q.length; i++) {
      for (const nb of zipNeighbors(board, q[i])) {
        if (seen[nb] || (vis[nb] && nb !== at)) continue;
        seen[nb] = 1;
        reach += 1;
        q.push(nb);
      }
    }
    return reach === remain + 1;
  }

  function dfs(at: number, visitedCount: number, nextNum: number): boolean {
    if (found >= limit) return true;
    if (visitedCount === n) {
      if (nextNum === lastNum + 1) found += 1;
      return found >= limit;
    }
    if (!connected(at, visitedCount)) return false;
    if (nextNum <= lastNum) {
      const need = pos[nextNum];
      if (manhattan(board.size, at, need) > n - visitedCount) return false;
    }
    for (const nb of zipNeighbors(board, at)) {
      if (vis[nb]) continue;
      const num = board.numbers[nb];
      if (num != null && num !== nextNum) continue;
      vis[nb] = 1;
      const nxt = num === nextNum ? nextNum + 1 : nextNum;
      if (dfs(nb, visitedCount + 1, nxt)) return true;
      vis[nb] = 0;
    }
    return false;
  }

  vis[start] = 1;
  dfs(start, 1, 2);
  return found;
}
