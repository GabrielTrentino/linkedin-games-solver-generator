import { parseSudokuBoard } from "../../engines/mini-sudoku/model";

type Props = { payload: string };

export function SudokuPreview({ payload }: Props) {
  let board: ReturnType<typeof parseSudokuBoard>;
  try {
    board = parseSudokuBoard(payload);
  } catch {
    return <div className="qpreview qpreview--empty" aria-hidden />;
  }
  return (
    <div className="qpreview spreview" style={{ gridTemplateColumns: "repeat(6, 1fr)" }} aria-hidden>
      {board.givens.map((cell, at) => (
        <span key={at} className={cell ? "is-filled" : ""}>
          {cell || ""}
        </span>
      ))}
    </div>
  );
}
