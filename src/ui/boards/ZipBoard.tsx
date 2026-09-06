import {
  hWallIndex,
  vWallIndex,
  zipCol,
  zipRow,
  type ZipBoard,
} from "../../engines/zip/model";

type Props = {
  board: ZipBoard;
  path: number[];
  conflicts: Set<number>;
  disabled?: boolean;
  onHover: (at: number) => void;
  onDown: (at: number) => void;
};

export function ZipBoardView({ board, path, conflicts, disabled, onHover, onDown }: Props) {
  const size = board.size;
  const order = new Map(path.map((at, i) => [at, i]));

  function cellFromPoint(clientX: number, clientY: number, grid: HTMLElement) {
    const hit = document.elementFromPoint(clientX, clientY);
    if (!hit || !grid.contains(hit)) return;
    const btn = hit.closest("[data-zip-at]");
    if (!btn) return;
    onHover(Number((btn as HTMLElement).dataset.zipAt));
  }

  return (
    <div
      className="zboard"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="grid"
      aria-label={`Zip ${size} por ${size}`}
      onPointerMove={(event) => {
        if (disabled || event.buttons === 0) return;
        cellFromPoint(event.clientX, event.clientY, event.currentTarget);
      }}
    >
      {Array.from({ length: size * size }, (_, at) => {
        const row = zipRow(size, at);
        const col = zipCol(size, at);
        const wallE = col < size - 1 && board.hWalls[hWallIndex(size, row, col)];
        const wallS = row < size - 1 && board.vWalls[vWallIndex(size, row, col)];
        const on = order.has(at);
        const classes = [
          "zcell",
          on ? "is-path" : "",
          conflicts.has(at) ? "is-conflict" : "",
          wallE ? "zcell--wall-e" : "",
          wallS ? "zcell--wall-s" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const num = board.numbers[at];
        return (
          <button
            key={at}
            type="button"
            role="gridcell"
            data-zip-at={at}
            className={classes}
            disabled={disabled}
            aria-label={`Linha ${row + 1}, coluna ${col + 1}${num ? `, número ${num}` : ""}`}
            onPointerDown={(event) => {
              event.preventDefault();
              onDown(at);
            }}
          >
            {num ?? ""}
          </button>
        );
      })}
    </div>
  );
}
