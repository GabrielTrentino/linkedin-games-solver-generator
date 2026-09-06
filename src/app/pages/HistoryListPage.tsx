import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES, isGameId } from "../../engines/core/types";
import { listAttempts, listPuzzles, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { formatElapsed } from "../../play/time";
import { QueensPreview } from "../../ui/boards/QueensPreview";
import { GameGlyph } from "../../ui/GameGlyph";

function bestTime(attempts: AttemptRow[], puzzleId: string) {
  const done = attempts.filter((a) => a.puzzleId === puzzleId && a.completed);
  if (!done.length) return null;
  return Math.min(...done.map((a) => a.elapsedMs));
}

export function HistoryListPage() {
  const { gameId } = useParams();
  const [puzzles, setPuzzles] = useState<PuzzleRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);

  useEffect(() => {
    Promise.all([listPuzzles(), listAttempts()]).then(([p, a]) => {
      setPuzzles(p);
      setAttempts(a);
    });
  }, []);

  const game = isGameId(gameId) ? gameId : null;
  const filtered = puzzles.filter((p) => p.game === game);
  const meta = GAMES.find((g) => g.id === game);

  if (!game || !meta) return null;

  if (filtered.length === 0) {
    return (
      <div className="empty">
        <h2>Nenhuma fase de {meta.name} ainda</h2>
        <p>Gere uma fase nova para ela aparecer aqui, com prévia e tempos.</p>
        <Link className="text-link" to={`/game/${game}/nova`}>
          Nova fase
        </Link>
      </div>
    );
  }

  return (
    <ul className="ledger">
      {filtered.map((puzzle) => {
        const diff = DIFFICULTIES.find((d) => d.id === puzzle.difficulty);
        const tries = attempts.filter((a) => a.puzzleId === puzzle.id);
        const wins = tries.filter((a) => a.completed);
        const best = bestTime(attempts, puzzle.id);
        return (
          <li key={puzzle.id}>
            <Link className="ledger__row" to={`/game/${game}/fase/${puzzle.id}`}>
              {puzzle.game === "queens" ? (
                <QueensPreview payload={puzzle.payload} />
              ) : (
                <GameGlyph game={puzzle.game} className="glyph--sm" />
              )}
              <span>
                <strong>
                  {diff?.name} · seed {puzzle.seed}
                </strong>
                <span className="muted">
                  {wins.length} resolução{wins.length === 1 ? "" : "ões"} · {tries.length} tentativa
                  {tries.length === 1 ? "" : "s"}
                </span>
                <span className="ledger__time">
                  {best == null ? "Ainda sem tempo" : `Melhor ${formatElapsed(best)}`}
                </span>
              </span>
              <span className="ledger__go">Execuções</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
