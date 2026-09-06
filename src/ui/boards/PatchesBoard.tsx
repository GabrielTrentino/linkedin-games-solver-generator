import {
  clueAtCell,
  patchesCol,
  patchesRow,
  rectCells,
  type PatchRect,
  type PatchesBoard,
} from "../../engines/patches/model";

const TINTS = ["#8bb89a", "#d4a574", "#7ba3c9", "#e0c56e", "#c97b7b", "#b7a3d4"];

type Props = {
  board: PatchesBoard;
  rects: PatchRect[];
  draft: PatchRect | null;
  conflicts: Set<number>;
  disabled?: boolean;
  onDown: (at: number) => void;
  onMove: (at: number) => void;
};

function glyph(shape: string) {
  if (shape === "square") return "□";
  if (shape === "tall") return "▯";
  if (shape === "wide") return "▭";
  return "";
}

export function PatchesBoardView({ board, rects, draft, conflicts, disabled, onDown, onMove }: Props) {
  const owner = new Map<number, number>();
  rects.forEach((rect, i) => {
    for (const at of rectCells(board, rect)) owner.set(at, i);
  });
  const draftCells = draft ? new Set(rectCells(board, draft)) : new Set<number>();

  function hit(clientX: number, clientY: number, grid: HTMLElement) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !grid.contains(el)) return;
    const btn = el.closest("[data-patch-at]");
    if (!btn) return;
    onMove(Number((btn as HTMLElement).dataset.patchAt));
  }

  return (
    <div
      className="pboard"
      style={{ gridTemplateColumns: `repeat(${board.cols}, 1fr)` }}
      role="grid"
      aria-label={`Patches ${board.rows} por ${board.cols}`}
      onPointerMove={(event) => {
        if (disabled || event.buttons === 0) return;
        hit(event.clientX, event.clientY, event.currentTarget);
      }}
    >
      {Array.from({ length: board.rows * board.cols }, (_, at) => {
        const row = patchesRow(board, at);
        const col = patchesCol(board, at);
        const clue = clueAtCell(board, at);
        const tint = owner.get(at);
        const classes = [
          "pcell",
          clue ? "is-clue" : "",
          draftCells.has(at) ? "is-draft" : "",
          conflicts.has(at) ? "is-conflict" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={at}
            type="button"
            data-patch-at={at}
            className={classes}
            disabled={disabled}
            style={tint != null && !conflicts.has(at) ? { background: TINTS[tint % TINTS.length] } : undefined}
            aria-label={`Linha ${row + 1}, coluna ${col + 1}${clue ? `, pista ${clue.area}` : ""}`}
            onPointerDown={(event) => {
              event.preventDefault();
              onDown(at);
            }}
          >
            {clue ? (
              <>
                <span className="pcell__area">{clue.area}</span>
                <span className="pcell__shape">{glyph(clue.shape)}</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function rectFromCorners(board: PatchesBoard, a: number, b: number): PatchRect {
  const r1 = patchesRow(board, a);
  const c1 = patchesCol(board, a);
  const r2 = patchesRow(board, b);
  const c2 = patchesCol(board, b);
  const row = Math.min(r1, r2);
  const col = Math.min(c1, c2);
  return {
    row,
    col,
    h: Math.abs(r1 - r2) + 1,
    w: Math.abs(c1 - c2) + 1,
  };
}
