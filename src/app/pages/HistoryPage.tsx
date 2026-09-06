import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DIFFICULTIES, GAMES } from "../../engines/core/types";
import { listAttempts, listPuzzles, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { GameGlyph } from "../../ui/GameGlyph";

export function HistoryPage() {
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
        <p className="eyebrow">Caderno</p>
        <h2>Nenhuma fase ainda</h2>
        <p>Abra um jogo na mesa. Cada geração fica gravada neste navegador.</p>
        <Link className="text-link" to="/">
          Ir à mesa
        </Link>
      </div>
    );
  }

  return (
    <section>
      <header className="mesa__head">
        <p className="eyebrow">Caderno</p>
        <h2>Fases deste navegador</h2>
      </header>
      <ul className="ledger">
        {puzzles.map((puzzle) => {
          const game = GAMES.find((g) => g.id === puzzle.game);
          const diff = DIFFICULTIES.find((d) => d.id === puzzle.difficulty);
          const tries = attempts.filter((a) => a.puzzleId === puzzle.id).length;
          return (
            <li key={puzzle.id}>
              <Link className="ledger__row" to={`/play/${puzzle.id}`}>
                <GameGlyph game={puzzle.game} className="glyph--sm" />
                <span>
                  <strong>{game?.name}</strong>
                  <span className="muted">
                    {diff?.name} · seed {puzzle.seed} · {tries} tentativa
                    {tries === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="ledger__go">Reabrir</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
