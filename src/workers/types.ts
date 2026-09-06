import type { Difficulty, GameId, Puzzle } from "../engines/core/types";

export type GenerateRequest = {
  game: GameId;
  seed: string;
  difficulty: Difficulty;
  generatorVersion: string;
};

export type GenerateResponse = { puzzle: Puzzle } | { error: string };
