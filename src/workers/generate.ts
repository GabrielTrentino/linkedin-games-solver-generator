import { noopEngine } from "../engines/noop/engine";
import type { GenerateRequest, GenerateResponse } from "./types";

self.onmessage = (event: MessageEvent<GenerateRequest>) => {
  const { seed, difficulty, generatorVersion, game } = event.data;
  try {
    const puzzle = noopEngine.generate(seed, difficulty, generatorVersion);
    const result: GenerateResponse = {
      puzzle: { ...puzzle, game },
    };
    self.postMessage(result);
  } catch (error) {
    const result: GenerateResponse = {
      error: error instanceof Error ? error.message : "Falha ao gerar",
    };
    self.postMessage(result);
  }
};
