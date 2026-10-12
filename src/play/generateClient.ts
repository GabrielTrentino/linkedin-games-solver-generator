import type { Difficulty, GameId, Puzzle } from "../engines/core/types";
import type { GenerateResponse } from "../workers/types";

export class GenerationCancelled extends Error {
  constructor() {
    super("Geração cancelada.");
    this.name = "GenerationCancelled";
  }
}

export type GenerationJob = {
  promise: Promise<Puzzle>;
  /** Encerra o worker na hora. A promise rejeita com `GenerationCancelled`. */
  cancel: () => void;
};

export function generatePuzzle(input: {
  game: GameId;
  seed: string;
  difficulty: Difficulty;
  generatorVersion: string;
}): GenerationJob {
  const worker = new Worker(new URL("../workers/generate.ts", import.meta.url), {
    type: "module",
  });

  let settle: ((fn: () => void) => void) | null = null;
  let rejectFn: (error: Error) => void = () => {};

  const promise = new Promise<Puzzle>((resolve, reject) => {
    let done = false;
    rejectFn = reject;
    settle = (fn) => {
      if (done) return;
      done = true;
      worker.terminate();
      fn();
    };
    worker.onmessage = (event: MessageEvent<GenerateResponse>) => {
      settle?.(() => {
        if ("error" in event.data) reject(new Error(event.data.error));
        else resolve(event.data.puzzle);
      });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      settle?.(() =>
        reject(new Error(event.message ? `Falha no gerador: ${event.message}` : "Falha no gerador.")),
      );
    };
    worker.postMessage(input);
  });

  return {
    promise,
    cancel: () => settle?.(() => rejectFn(new GenerationCancelled())),
  };
}
