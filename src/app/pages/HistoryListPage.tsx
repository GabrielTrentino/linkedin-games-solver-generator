import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DIFFICULTIES, GAMES } from "../../engines/core/types";
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
  const [puzzles, setPuzzles] = useState<PuzzleRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);

  useEffect(() => {
    Promise.all([listPuzzles(), listAttempts()]).then(([p, a]) => {
      setPuzzles(p);
      setAttempts(a);
    });
  }, []);

  if (puzzles.length === 0) {
    return (
      <div className="empty">
        <h2>Nenhuma fase ainda</h2>
        <p>Abra um jogo na mesa. Cada geração fica gravada neste navegador.</p>
        <Link className="text-link" to="/">
          Ir à mesa
        </Link>
      </div>
    );
  }

  return (
    <ul className="ledger">
      {puzzles.map((puzzle) => {
        const game = GAMES.find((g) => g.id === puzzle.game);
        const diff = DIFFICULTIES.find((d) => d.id === puzzle.difficulty);
        const tries = attempts.filter((a) => a.puzzleId === puzzle.id);
        const wins = tries.filter((a) => a.completed);
        const best = bestTime(attempts, puzzle.id);
        return (
          <li key={puzzle.id}>
            <Link className="ledger__row" to={`/play/${puzzle.id}`}>
              {puzzle.game === "queens" ? (
                <QueensPreview payload={puzzle.payload} />
              ) : (
                <GameGlyph game={puzzle.game} className="glyph--sm" />
              )}
              <span>
                <strong>{game?.name}</strong>
                <span className="muted">
                  {diff?.name} · seed {puzzle.seed} · {wins.length} resolução
                  {wins.length === 1 ? "" : "ões"} · {tries.length} tentativa
                  {tries.length === 1 ? "" : "s"}
                </span>
                <span className="ledger__time">
                  {best == null ? "Ainda sem tempo" : `Melhor ${formatElapsed(best)}`}
                </span>
              </span>
              <span className="ledger__go">Jogar</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
