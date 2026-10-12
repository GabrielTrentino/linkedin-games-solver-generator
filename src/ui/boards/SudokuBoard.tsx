import { SUDOKU_BOX_H, SUDOKU_BOX_W, SUDOKU_SIZE, colOf, rowOf, type SudokuBoard, type SudokuCell } from "../../engines/mini-sudoku/model";
import { useRovingGrid } from "./useRovingGrid";

type Props = {
  board: SudokuBoard;
  cells: SudokuCell[];
  conflicts: Set<number>;
  selected: number | null;
  disabled?: boolean;
  onCell: (at: number) => void;
  /** Foco por teclado seleciona a casa sem escrever, para digitar 1–6 em seguida. */
  onSelect?: (at: number) => void;
};

export function SudokuBoardView({ board, cells, conflicts, selected, disabled, onCell, onSelect }: Props) {
  const grid = useRovingGrid(SUDOKU_SIZE, SUDOKU_SIZE);
  return (
    <div
      className="sboard"
      style={{ gridTemplateColumns: `repeat(${SUDOKU_SIZE}, 1fr)` }}
      role="grid"
      aria-label="Mini Sudoku 6 por 6"
    >
      {cells.map((cell, at) => {
        const row = rowOf(at);
        const col = colOf(at);
        const given = board.givens[at] !== 0;
        const boxEdgeE = (col + 1) % SUDOKU_BOX_W === 0 && col < SUDOKU_SIZE - 1;
        const boxEdgeS = (row + 1) % SUDOKU_BOX_H === 0 && row < SUDOKU_SIZE - 1;
        const classes = [
          "scell",
          given ? "is-given" : "",
          conflicts.has(at) ? "is-conflict" : "",
          selected === at ? "is-selected" : "",
          boxEdgeE ? "scell--box-e" : "",
          boxEdgeS ? "scell--box-s" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={at}
            type="button"
            role="gridcell"
            className={classes}
            disabled={disabled}
            aria-disabled={given || undefined}
            aria-invalid={conflicts.has(at) || undefined}
            aria-selected={selected === at}
            aria-label={`Linha ${row + 1}, coluna ${col + 1}. ${given ? "Dada. " : ""}${cell || "Vazia"}${conflicts.has(at) ? ". Repetido" : ""}`}
            {...grid.cellProps(at)}
            onFocus={() => {
              grid.activate(at);
              if (!given) onSelect?.(at);
            }}
            onKeyDown={(event) => grid.onKeyDown(event, at)}
            onClick={() => {
              if (!given) onCell(at);
            }}
          >
            {cell || ""}
          </button>
        );
      })}
    </div>
  );
}
