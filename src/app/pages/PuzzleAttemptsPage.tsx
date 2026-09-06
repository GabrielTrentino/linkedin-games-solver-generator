import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES, isGameId } from "../../engines/core/types";
import { getPuzzle, listAttempts, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { QueensPreview } from "../../ui/boards/QueensPreview";
import { GameGlyph } from "../../ui/GameGlyph";
import { AttemptsTable } from "./AttemptsTable";

export function PuzzleAttemptsPage() {
  const { gameId, puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState<PuzzleRow | null | undefined>(undefined);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);

  useEffect(() => {
    if (!puzzleId) return;
    Promise.all([getPuzzle(puzzleId), listAttempts()]).then(([p, a]) => {
      setPuzzle(p ?? null);
      setAttempts(a.filter((row) => row.puzzleId === puzzleId));
    });
  }, [puzzleId]);

  if (puzzle === undefined) return <p className="lede">Abrindo execuções…</p>;

  if (!isGameId(gameId) || !puzzle || puzzle.game !== gameId) {
    return (
      <div className="empty">
        <h2>Fase não encontrada neste jogo</h2>
        <Link className="text-link" to={isGameId(gameId) ? `/game/${gameId}` : "/"}>
          Voltar à lista
        </Link>
      </div>
    );
  }

  const meta = GAMES.find((g) => g.id === puzzle.game);
  const diff = DIFFICULTIES.find((d) => d.id === puzzle.difficulty);
  const rows = [...attempts]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((row) => ({
      id: row.id,
      seed: puzzle.seed,
      puzzleId: puzzle.id,
      startedAt: row.startedAt,
      elapsedMs: row.elapsedMs,
      completed: row.completed,
    }));

  return (
    <div className="seed-runs">
      <div className="seed-runs__head">
        {puzzle.game === "queens" ? (
          <QueensPreview payload={puzzle.payload} />
        ) : (
          <GameGlyph game={puzzle.game} className="glyph--sm" />
        )}
        <div>
          <h3>
            {meta?.name} · seed {puzzle.seed}
          </h3>
          <p className="lede">
            {diff?.name} · {rows.filter((r) => r.completed).length} resolução
            {rows.filter((r) => r.completed).length === 1 ? "" : "ões"}
          </p>
          <Link className="play" to={`/play/${puzzle.id}`}>
            Jogar esta seed
          </Link>
        </div>
      </div>
      <h3>Execuções</h3>
      <AttemptsTable rows={rows} gameId={puzzle.game} showSeed={false} />
    </div>
  );
}
