import {
  clueAtCell,
  clueIndexIn,
  patchesCol,
  patchesRow,
  rectCells,
  type PatchRect,
  type PatchShape,
  type PatchesBoard,
} from "../../engines/patches/model";

type Props = {
  board: PatchesBoard;
  rects: PatchRect[];
  draft: PatchRect | null;
  conflicts: Set<number>;
  disabled?: boolean;
  onDown: (at: number) => void;
  onMove: (at: number) => void;
};

/**
 * Uma cor por pista, espaçadas pelo ângulo áureo: o tabuleiro pode ter
 * quantas pistas forem preciso sem duas cores repetidas.
 */
export function clueColor(index: number) {
  const hue = (index * 137.508) % 360;
  const light = index % 2 === 0 ? 76 : 84;
  return `hsl(${hue.toFixed(1)} 58% ${light}%)`;
}

function ShapeMark({ shape }: { shape: PatchShape }) {
  if (shape === "any") {
    return (
      <svg className="pcell__shape" viewBox="0 0 20 20" aria-hidden>
        <rect x="3" y="3" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 2" />
      </svg>
    );
  }
  const box =
    shape === "square"
      ? { x: 4, y: 4, width: 12, height: 12 }
      : shape === "tall"
        ? { x: 6, y: 2.5, width: 8, height: 15 }
        : { x: 2.5, y: 6, width: 15, height: 8 };
  return (
    <svg className="pcell__shape" viewBox="0 0 20 20" aria-hidden>
      <rect {...box} rx="1" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const SHAPE_NAME: Record<PatchShape, string> = {
  square: "quadrado",
  tall: "retângulo em pé",
  wide: "retângulo deitado",
  any: "forma livre",
};

export function PatchesBoardView({ board, rects, draft, conflicts, disabled, onDown, onMove }: Props) {
  // Dono de cada casa: índice do retângulo (o último que cobre, se houver sobreposição).
  const owner = new Map<number, number>();
  rects.forEach((rect, i) => {
    for (const at of rectCells(board, rect)) owner.set(at, i);
  });
  const draftCells = draft ? new Set(rectCells(board, draft)) : new Set<number>();
  const clueOfRect = rects.map((rect) => clueIndexIn(board, rect));

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
        const mine = owner.get(at);
        const sameOwner = (other: number | undefined) => other === mine;
        const up = row > 0 ? owner.get(at - board.cols) : undefined;
        const down = row < board.rows - 1 ? owner.get(at + board.cols) : undefined;
        const left = col > 0 ? owner.get(at - 1) : undefined;
        const right = col < board.cols - 1 ? owner.get(at + 1) : undefined;
        const conflict = conflicts.has(at);
        const clueIdx = mine != null ? clueOfRect[mine] : -1;
        const tinted = mine != null && !conflict && clueIdx >= 0;

        const classes = [
          "pcell",
          clue ? "is-clue" : "",
          tinted ? "is-tinted" : "",
          draftCells.has(at) ? "is-draft" : "",
          conflict ? "is-conflict" : "",
          mine != null && !sameOwner(up) ? "pcell--n" : "",
          mine != null && !sameOwner(down) ? "pcell--s" : "",
          mine != null && !sameOwner(left) ? "pcell--w" : "",
          mine != null && !sameOwner(right) ? "pcell--e" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const label = [
          `Linha ${row + 1}, coluna ${col + 1}`,
          clue ? `pista ${clue.area}, ${SHAPE_NAME[clue.shape]}` : "",
          conflict ? "em conflito" : "",
        ]
          .filter(Boolean)
          .join(", ");

        return (
          <button
            key={at}
            type="button"
            data-patch-at={at}
            className={classes}
            disabled={disabled}
            style={tinted ? { backgroundColor: clueColor(clueIdx) } : undefined}
            aria-label={label}
            onPointerDown={(event) => {
              event.preventDefault();
              onDown(at);
            }}
          >
            {clue ? (
              <>
                <span className="pcell__area">{clue.area}</span>
                <ShapeMark shape={clue.shape} />
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
  return {
    row: Math.min(r1, r2),
    col: Math.min(c1, c2),
    h: Math.abs(r1 - r2) + 1,
    w: Math.abs(c1 - c2) + 1,
  };
}
