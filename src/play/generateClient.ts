import type { Difficulty, GameId, Puzzle } from "../engines/core/types";
import type { GenerateResponse } from "../workers/types";

export function generatePuzzle(input: {
  game: GameId;
  seed: string;
  difficulty: Difficulty;
  generatorVersion: string;
}): Promise<Puzzle> {
  const worker = new Worker(new URL("../workers/generate.ts", import.meta.url), {
    type: "module",
  });

  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<GenerateResponse>) => {
      worker.terminate();
      if ("error" in event.data) reject(new Error(event.data.error));
      else resolve(event.data.puzzle);
    };
    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
    worker.postMessage(input);
  });
}
