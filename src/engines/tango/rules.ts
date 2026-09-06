import type { RuleViolation } from "../core/types";
import {
  TANGO_SIZE,
  colOf,
  hLinkIndex,
  indexOf,
  rowOf,
  vLinkIndex,
  type TangoBoard,
  type TangoCell,
  type TangoState,
  type TangoSym,
} from "./model";

function valueAt(board: TangoBoard, state: TangoState, at: number): TangoCell {
  return board.givens[at] ?? state.cells[at] ?? "empty";
}

function lineValues(get: (i: number) => TangoCell): TangoCell[] {
  return Array.from({ length: TANGO_SIZE }, (_, i) => get(i));
}

function tripleHits(values: TangoCell[]): number[] {
  const hit: number[] = [];
  for (let i = 0; i < TANGO_SIZE - 2; i++) {
    const a = values[i];
    if (a === "empty") continue;
    if (a === values[i + 1] && a === values[i + 2]) {
      hit.push(i, i + 1, i + 2);
    }
  }
  return hit;
}

function counts(values: TangoCell[]) {
  let sun = 0;
  let moon = 0;
  for (const v of values) {
    if (v === "sun") sun += 1;
    if (v === "moon") moon += 1;
  }
  return { sun, moon };
}

export function validateTango(board: TangoBoard, state: TangoState): RuleViolation[] {
  const hits = new Set<string>();
  const get = (at: number) => valueAt(board, state, at);

  for (let row = 0; row < TANGO_SIZE; row++) {
    const values = lineValues((c) => get(indexOf(row, c)));
    if (tripleHits(values).length) hits.add("trio:row");
    const { sun, moon } = counts(values);
    if (sun > 3) hits.add("count:sun-row");
    if (moon > 3) hits.add("count:moon-row");
  }
  for (let col = 0; col < TANGO_SIZE; col++) {
    const values = lineValues((r) => get(indexOf(r, col)));
    if (tripleHits(values).length) hits.add("trio:col");
    const { sun, moon } = counts(values);
    if (sun > 3) hits.add("count:sun-col");
    if (moon > 3) hits.add("count:moon-col");
  }

  for (let row = 0; row < TANGO_SIZE; row++) {
    for (let col = 0; col < TANGO_SIZE - 1; col++) {
      const link = board.hLinks[hLinkIndex(row, col)];
      if (!link) continue;
      const a = get(indexOf(row, col));
      const b = get(indexOf(row, col + 1));
      if (a === "empty" || b === "empty") continue;
      if (link === "eq" && a !== b) hits.add("link:eq");
      if (link === "neq" && a === b) hits.add("link:neq");
    }
  }
  for (let row = 0; row < TANGO_SIZE - 1; row++) {
    for (let col = 0; col < TANGO_SIZE; col++) {
      const link = board.vLinks[vLinkIndex(row, col)];
      if (!link) continue;
      const a = get(indexOf(row, col));
      const b = get(indexOf(row + 1, col));
      if (a === "empty" || b === "empty") continue;
      if (link === "eq" && a !== b) hits.add("link:eq");
      if (link === "neq" && a === b) hits.add("link:neq");
    }
  }

  const completeRows: string[] = [];
  for (let row = 0; row < TANGO_SIZE; row++) {
    const values = lineValues((c) => get(indexOf(row, c)));
    if (values.some((v) => v === "empty")) continue;
    const key = values.join("");
    if (completeRows.includes(key)) hits.add("dup:row");
    completeRows.push(key);
  }
  const completeCols: string[] = [];
  for (let col = 0; col < TANGO_SIZE; col++) {
    const values = lineValues((r) => get(indexOf(r, col)));
    if (values.some((v) => v === "empty")) continue;
    const key = values.join("");
    if (completeCols.includes(key)) hits.add("dup:col");
    completeCols.push(key);
  }

  return [...hits].map((code) => ({ code, message: messageFor(code) }));
}

function messageFor(code: string) {
  if (code.startsWith("trio")) return "Três símbolos iguais seguidos";
  if (code.startsWith("count")) return "Mais de três sóis ou luas na linha ou coluna";
  if (code === "link:eq") return "Casas ligadas por = precisam ser iguais";
  if (code === "link:neq") return "Casas ligadas por × precisam ser diferentes";
  if (code === "dup:row") return "Duas linhas iguais";
  if (code === "dup:col") return "Duas colunas iguais";
  return "Regra quebrada";
}

export function conflictingCells(board: TangoBoard, state: TangoState): Set<number> {
  const bad = new Set<number>();
  const get = (at: number) => valueAt(board, state, at);

  for (let row = 0; row < TANGO_SIZE; row++) {
    const values = lineValues((c) => get(indexOf(row, c)));
    for (const i of tripleHits(values)) bad.add(indexOf(row, i));
    const { sun, moon } = counts(values);
    if (sun > 3) {
      values.forEach((v, c) => {
        if (v === "sun") bad.add(indexOf(row, c));
      });
    }
    if (moon > 3) {
      values.forEach((v, c) => {
        if (v === "moon") bad.add(indexOf(row, c));
      });
    }
  }
  for (let col = 0; col < TANGO_SIZE; col++) {
    const values = lineValues((r) => get(indexOf(r, col)));
    for (const i of tripleHits(values)) bad.add(indexOf(i, col));
    const { sun, moon } = counts(values);
    if (sun > 3) {
      values.forEach((v, r) => {
        if (v === "sun") bad.add(indexOf(r, col));
      });
    }
    if (moon > 3) {
      values.forEach((v, r) => {
        if (v === "moon") bad.add(indexOf(r, col));
      });
    }
  }

  for (let row = 0; row < TANGO_SIZE; row++) {
    for (let col = 0; col < TANGO_SIZE - 1; col++) {
      const link = board.hLinks[hLinkIndex(row, col)];
      if (!link) continue;
      const aAt = indexOf(row, col);
      const bAt = indexOf(row, col + 1);
      const a = get(aAt);
      const b = get(bAt);
      if (a === "empty" || b === "empty") continue;
      if ((link === "eq" && a !== b) || (link === "neq" && a === b)) {
        bad.add(aAt);
        bad.add(bAt);
      }
    }
  }
  for (let row = 0; row < TANGO_SIZE - 1; row++) {
    for (let col = 0; col < TANGO_SIZE; col++) {
      const link = board.vLinks[vLinkIndex(row, col)];
      if (!link) continue;
      const aAt = indexOf(row, col);
      const bAt = indexOf(row + 1, col);
      const a = get(aAt);
      const b = get(bAt);
      if (a === "empty" || b === "empty") continue;
      if ((link === "eq" && a !== b) || (link === "neq" && a === b)) {
        bad.add(aAt);
        bad.add(bAt);
      }
    }
  }

  const rowKeys = new Map<string, number[]>();
  for (let row = 0; row < TANGO_SIZE; row++) {
    const values = lineValues((c) => get(indexOf(row, c)));
    if (values.some((v) => v === "empty")) continue;
    const key = values.join("");
    const list = rowKeys.get(key) ?? [];
    list.push(row);
    rowKeys.set(key, list);
  }
  for (const rows of rowKeys.values()) {
    if (rows.length < 2) continue;
    for (const row of rows) {
      for (let col = 0; col < TANGO_SIZE; col++) bad.add(indexOf(row, col));
    }
  }
  const colKeys = new Map<string, number[]>();
  for (let col = 0; col < TANGO_SIZE; col++) {
    const values = lineValues((r) => get(indexOf(r, col)));
    if (values.some((v) => v === "empty")) continue;
    const key = values.join("");
    const list = colKeys.get(key) ?? [];
    list.push(col);
    colKeys.set(key, list);
  }
  for (const cols of colKeys.values()) {
    if (cols.length < 2) continue;
    for (const col of cols) {
      for (let row = 0; row < TANGO_SIZE; row++) bad.add(indexOf(row, col));
    }
  }

  return bad;
}

export function isTangoSolved(board: TangoBoard, state: TangoState) {
  const get = (at: number) => valueAt(board, state, at);
  if (Array.from({ length: 36 }, (_, at) => get(at)).some((v) => v === "empty")) return false;
  if (validateTango(board, state).length > 0) return false;
  for (let row = 0; row < TANGO_SIZE; row++) {
    const { sun, moon } = counts(lineValues((c) => get(indexOf(row, c))));
    if (sun !== 3 || moon !== 3) return false;
  }
  for (let col = 0; col < TANGO_SIZE; col++) {
    const { sun, moon } = counts(lineValues((r) => get(indexOf(r, col))));
    if (sun !== 3 || moon !== 3) return false;
  }
  return true;
}

export function partialOk(cells: Array<TangoSym | null>, board: TangoBoard, at: number) {
  const get = (i: number): TangoCell => cells[i] ?? "empty";
  const row = rowOf(at);
  const col = colOf(at);
  const rowVals = lineValues((c) => get(indexOf(row, c)));
  const colVals = lineValues((r) => get(indexOf(r, col)));
  if (tripleHits(rowVals).length || tripleHits(colVals).length) return false;
  const rc = counts(rowVals);
  const cc = counts(colVals);
  if (rc.sun > 3 || rc.moon > 3 || cc.sun > 3 || cc.moon > 3) return false;
  if (!rowVals.includes("empty") && (rc.sun !== 3 || rc.moon !== 3)) return false;
  if (!colVals.includes("empty") && (cc.sun !== 3 || cc.moon !== 3)) return false;

  if (col > 0) {
    const link = board.hLinks[hLinkIndex(row, col - 1)];
    const other = get(indexOf(row, col - 1));
    const here = get(at);
    if (link && other !== "empty" && here !== "empty") {
      if (link === "eq" && other !== here) return false;
      if (link === "neq" && other === here) return false;
    }
  }
  if (col < TANGO_SIZE - 1) {
    const link = board.hLinks[hLinkIndex(row, col)];
    const other = get(indexOf(row, col + 1));
    const here = get(at);
    if (link && other !== "empty" && here !== "empty") {
      if (link === "eq" && other !== here) return false;
      if (link === "neq" && other === here) return false;
    }
  }
  if (row > 0) {
    const link = board.vLinks[vLinkIndex(row - 1, col)];
    const other = get(indexOf(row - 1, col));
    const here = get(at);
    if (link && other !== "empty" && here !== "empty") {
      if (link === "eq" && other !== here) return false;
      if (link === "neq" && other === here) return false;
    }
  }
  if (row < TANGO_SIZE - 1) {
    const link = board.vLinks[vLinkIndex(row, col)];
    const other = get(indexOf(row + 1, col));
    const here = get(at);
    if (link && other !== "empty" && here !== "empty") {
      if (link === "eq" && other !== here) return false;
      if (link === "neq" && other === here) return false;
    }
  }

  if (!rowVals.includes("empty")) {
    for (let r = 0; r < TANGO_SIZE; r++) {
      if (r === row) continue;
      const other = lineValues((c) => get(indexOf(r, c)));
      if (other.includes("empty")) continue;
      if (other.join("") === rowVals.join("")) return false;
    }
  }
  if (!colVals.includes("empty")) {
    for (let c = 0; c < TANGO_SIZE; c++) {
      if (c === col) continue;
      const other = lineValues((r) => get(indexOf(r, c)));
      if (other.includes("empty")) continue;
      if (other.join("") === colVals.join("")) return false;
    }
  }
  return true;
}

export function countSolutions(board: TangoBoard, limit = 2): number {
  const cells: Array<TangoSym | null> = board.givens.slice();
  let count = 0;
  const order: TangoSym[] = ["sun", "moon"];

  function search(i: number) {
    if (count >= limit) return;
    while (i < 36 && cells[i] != null) i += 1;
    if (i === 36) {
      count += 1;
      return;
    }
    for (const v of order) {
      cells[i] = v;
      if (partialOk(cells, board, i)) search(i + 1);
      if (count >= limit) return;
    }
    cells[i] = null;
  }

  search(0);
  return count;
}
