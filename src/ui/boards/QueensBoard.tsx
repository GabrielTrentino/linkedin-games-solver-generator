import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { QueensBoard as QueensBoardModel, QueensCell } from "../../engines/queens/model";
import { REGION_COLORS, colOf, rowOf } from "../../engines/queens/model";
import { useRovingGrid } from "./useRovingGrid";

type Props = {
  board: QueensBoardModel;
  cells: QueensCell[];
  conflicts: Set<number>;
  disabled?: boolean;
  onCycle: (at: number) => void;
  onMarkPreview: (cells: number[]) => void;
  onMarkCommit: (cells: number[]) => void;
};

function labelFor(cell: QueensCell, conflict: boolean) {
  if (cell === "crown") return conflict ? "Coroa em conflito" : "Coroa";
  if (cell === "mark") return "Marcada";
  return "Vazia";
}

function cellFromPointer(boardEl: HTMLElement, size: number, x: number, y: number) {
  const rect = boardEl.getBoundingClientRect();
  if (x < rect.left || y < rect.top || x >= rect.right || y >= rect.bottom) return null;
  const col = Math.min(size - 1, Math.floor(((x - rect.left) / rect.width) * size));
  const row = Math.min(size - 1, Math.floor(((y - rect.top) / rect.height) * size));
  if (col < 0 || row < 0) return null;
  return row * size + col;
}

export function QueensBoard({
  board,
  cells,
  conflicts,
  disabled,
  onCycle,
  onMarkPreview,
  onMarkCommit,
}: Props) {
  const { size, regions } = board;
  const grid = useRovingGrid(size, size);
  const drag = useRef<{
    pointerId: number;
    origin: number;
    painting: boolean;
    marked: Set<number>;
  } | null>(null);

  function markable(at: number) {
    return cells[at] === "empty";
  }

  function addMark(at: number) {
    const session = drag.current;
    if (!session || !markable(at) || session.marked.has(at)) return;
    session.marked.add(at);
    onMarkPreview([...session.marked]);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    const at = cellFromPointer(event.currentTarget, size, event.clientX, event.clientY);
    if (at == null) return;
    drag.current = {
      pointerId: event.pointerId,
      origin: at,
      painting: false,
      marked: new Set(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const at = cellFromPointer(event.currentTarget, size, event.clientX, event.clientY);
    if (at == null) return;
    if (!session.painting && at !== session.origin) {
      session.painting = true;
      addMark(session.origin);
    }
    if (session.painting) addMark(at);
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (session.painting) {
      onMarkCommit([...session.marked]);
      return;
    }
    onCycle(session.origin);
  }

  function onCellKey(event: KeyboardEvent<HTMLButtonElement>, at: number) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onCycle(at);
  }

  return (
    <div
      className="qboard"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="grid"
      aria-label={`Queens ${size} por ${size}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      {cells.map((cell, at) => {
        const row = rowOf(size, at);
        const col = colOf(size, at);
        const region = regions[at];
        const edgeN = row === 0 || regions[at - size] !== region;
        const edgeS = row === size - 1 || regions[at + size] !== region;
        const edgeW = col === 0 || regions[at - 1] !== region;
        const edgeE = col === size - 1 || regions[at + 1] !== region;
        const conflict = conflicts.has(at);
        const classes = [
          "qcell",
          edgeN ? "qcell--n" : "",
          edgeS ? "qcell--s" : "",
          edgeW ? "qcell--w" : "",
          edgeE ? "qcell--e" : "",
          conflict ? "is-conflict" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={at}
            type="button"
            role="gridcell"
            className={classes}
            style={{ backgroundColor: REGION_COLORS[region % REGION_COLORS.length] }}
            aria-label={`Linha ${row + 1}, coluna ${col + 1}, região ${region + 1}. ${labelFor(cell, conflict)}`}
            aria-invalid={conflict || undefined}
            disabled={disabled}
            {...grid.cellProps(at)}
            onKeyDown={(event) => {
              if (!grid.onKeyDown(event, at)) onCellKey(event, at);
            }}
          >
            {cell === "crown" ? "♛" : cell === "mark" ? "×" : ""}
          </button>
        );
      })}
    </div>
  );
}
