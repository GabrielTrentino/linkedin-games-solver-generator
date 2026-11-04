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

  // Traçado no sentido em que foi desenhado: do 1 para a última casa.
  // Passa pelo centro das casas (não preenche a casa inteira).
  const centers = path.map((at) => ({
    x: zipCol(size, at) + 0.5,
    y: zipRow(size, at) + 0.5,
  }));
  const d = centers.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const head = centers[centers.length - 1];

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
      {centers.length > 0 ? (
        <svg
          className="zpath"
          viewBox={`0 0 ${size} ${size}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={d} className="zpath__line" />
          {centers.length > 1 ? <circle cx={head.x} cy={head.y} r="0.16" className="zpath__head" /> : null}
        </svg>
      ) : null}
      {Array.from({ length: size * size }, (_, at) => {
        const row = zipRow(size, at);
        const col = zipCol(size, at);
        const wallE = col < size - 1 && board.hWalls[hWallIndex(size, row, col)];
        const wallS = row < size - 1 && board.vWalls[vWallIndex(size, row, col)];
        const on = order.has(at);
        const classes = [
          "zcell",
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
            aria-label={`Linha ${row + 1}, coluna ${col + 1}${num ? `, número ${num}` : ""}${on ? `, passo ${(order.get(at) ?? 0) + 1} do caminho` : ""}${conflicts.has(at) ? ", em conflito" : ""}`}
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
