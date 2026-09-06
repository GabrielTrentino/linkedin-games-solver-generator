import type { GameId } from "./core/types";
import { noopEngine } from "./noop/engine";
import { queensEngine } from "./queens/engine";
import { tangoEngine } from "./tango/engine";

export function engineFor(game: GameId) {
  if (game === "queens") return queensEngine;
  if (game === "tango") return tangoEngine;
  return noopEngine;
}
