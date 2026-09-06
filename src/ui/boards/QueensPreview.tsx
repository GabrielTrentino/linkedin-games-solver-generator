import { REGION_COLORS, parseBoard } from "../../engines/queens/model";

type Props = {
  payload: string;
};

export function QueensPreview({ payload }: Props) {
  let board: ReturnType<typeof parseBoard>;
  try {
    board = parseBoard(payload);
  } catch {
    return <div className="qpreview qpreview--empty" aria-hidden />;
  }

  return (
    <div
      className="qpreview"
      style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)` }}
      aria-hidden
    >
      {board.regions.map((region, at) => (
        <span
          key={at}
          style={{ backgroundColor: REGION_COLORS[region % REGION_COLORS.length] }}
        />
      ))}
    </div>
  );
}
