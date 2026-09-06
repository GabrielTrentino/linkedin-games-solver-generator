import { parseTangoBoard } from "../../engines/tango/model";

type Props = {
  payload: string;
};

export function TangoPreview({ payload }: Props) {
  let board: ReturnType<typeof parseTangoBoard>;
  try {
    board = parseTangoBoard(payload);
  } catch {
    return <div className="qpreview qpreview--empty" aria-hidden />;
  }

  return (
    <div className="qpreview tpreview" style={{ gridTemplateColumns: "repeat(6, 1fr)" }} aria-hidden>
      {board.givens.map((cell, at) => (
        <span
          key={at}
          className={cell === "sun" ? "is-sun" : cell === "moon" ? "is-moon" : ""}
        />
      ))}
    </div>
  );
}
