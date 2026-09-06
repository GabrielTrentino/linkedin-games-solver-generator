import type { GameId } from "./core/types";
import { noopEngine } from "./noop/engine";
import { queensEngine } from "./queens/engine";

export function engineFor(game: GameId) {
  if (game === "queens") return queensEngine;
  return noopEngine;
}
