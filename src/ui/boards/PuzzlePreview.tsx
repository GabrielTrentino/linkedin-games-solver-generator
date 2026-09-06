import { PatchesPreview } from "./PatchesPreview";
import { QueensPreview } from "./QueensPreview";
import { SudokuPreview } from "./SudokuPreview";
import { TangoPreview } from "./TangoPreview";
import { ZipPreview } from "./ZipPreview";
import { GameGlyph } from "../GameGlyph";
import type { GameId } from "../../engines/core/types";

type Props = {
  game: GameId;
  payload: string;
};

export function PuzzlePreview({ game, payload }: Props) {
  if (game === "queens") return <QueensPreview payload={payload} />;
  if (game === "tango") return <TangoPreview payload={payload} />;
  if (game === "mini-sudoku") return <SudokuPreview payload={payload} />;
  if (game === "zip") return <ZipPreview payload={payload} />;
  if (game === "patches") return <PatchesPreview payload={payload} />;
  return <GameGlyph game={game} className="glyph--sm" />;
}
