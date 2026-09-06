import { parsePatchesBoard } from "../../engines/patches/model";

type Props = { payload: string };

export function PatchesPreview({ payload }: Props) {
  let board: ReturnType<typeof parsePatchesBoard>;
  try {
    board = parsePatchesBoard(payload);
  } catch {
    return <div className="qpreview qpreview--empty" aria-hidden />;
  }
  const clues = new Set(board.clues.map((c) => c.at));
  return (
    <div
      className="qpreview ppreview"
      style={{ gridTemplateColumns: `repeat(${board.cols}, 1fr)` }}
      aria-hidden
    >
      {Array.from({ length: board.rows * board.cols }, (_, at) => (
        <span key={at} className={clues.has(at) ? "is-clue" : ""} />
      ))}
    </div>
  );
}
