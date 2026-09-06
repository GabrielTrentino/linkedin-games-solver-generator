import type { GameId } from "./core/types";
import { noopEngine } from "./noop/engine";
import { queensEngine } from "./queens/engine";
import { miniSudokuEngine } from "./mini-sudoku/engine";
import { tangoEngine } from "./tango/engine";

import { zipEngine } from "./zip/engine";

export function engineFor(game: GameId) {
  if (game === "queens") return queensEngine;
  if (game === "tango") return tangoEngine;
  if (game === "mini-sudoku") return miniSudokuEngine;
  if (game === "zip") return zipEngine;
  return noopEngine;
}
