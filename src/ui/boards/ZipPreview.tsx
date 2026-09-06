import { parseZipBoard } from "../../engines/zip/model";

type Props = { payload: string };

export function ZipPreview({ payload }: Props) {
  let board: ReturnType<typeof parseZipBoard>;
  try {
    board = parseZipBoard(payload);
  } catch {
    return <div className="qpreview qpreview--empty" aria-hidden />;
  }
  return (
    <div
      className="qpreview zpreview"
      style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)` }}
      aria-hidden
    >
      {board.numbers.map((n, at) => (
        <span key={at} className={n ? "is-num" : ""} />
      ))}
    </div>
  );
}
