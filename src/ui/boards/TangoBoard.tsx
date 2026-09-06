import type { TangoBoard, TangoCell, TangoLink } from "../../engines/tango/model";
import { TANGO_SIZE, colOf, hLinkIndex, rowOf, vLinkIndex } from "../../engines/tango/model";

type Props = {
  board: TangoBoard;
  cells: TangoCell[];
  conflicts: Set<number>;
  disabled?: boolean;
  onCycle: (at: number) => void;
};

function glyph(cell: TangoCell) {
  if (cell === "sun") return "☀";
  if (cell === "moon") return "☾";
  return "";
}

function linkChar(link: TangoLink) {
  return link === "eq" ? "=" : "×";
}

export function TangoBoard({ board, cells, conflicts, disabled, onCycle }: Props) {
  return (
    <div
      className="tboard"
      style={{ gridTemplateColumns: `repeat(${TANGO_SIZE}, 1fr)` }}
      role="grid"
      aria-label="Tango 6 por 6"
    >
      {cells.map((cell, at) => {
        const row = rowOf(at);
        const col = colOf(at);
        const given = board.givens[at] != null;
        const h = col < TANGO_SIZE - 1 ? board.hLinks[hLinkIndex(row, col)] : null;
        const v = row < TANGO_SIZE - 1 ? board.vLinks[vLinkIndex(row, col)] : null;
        const conflict = conflicts.has(at);
        const classes = [
          "tcell",
          given ? "is-given" : "",
          conflict ? "is-conflict" : "",
          cell === "sun" ? "is-sun" : "",
          cell === "moon" ? "is-moon" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={at}
            type="button"
            role="gridcell"
            className={classes}
            disabled={disabled || given}
            aria-label={`Linha ${row + 1}, coluna ${col + 1}. ${given ? "Dada. " : ""}${cell === "empty" ? "Vazia" : cell === "sun" ? "Sol" : "Lua"}`}
            onClick={() => onCycle(at)}
          >
            {glyph(cell)}
            {h ? <span className="tlink tlink--e">{linkChar(h)}</span> : null}
            {v ? <span className="tlink tlink--s">{linkChar(v)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
