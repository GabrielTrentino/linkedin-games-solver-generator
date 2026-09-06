import { useEffect, useState } from "react";
import { GAMES, type GameId } from "../../engines/core/types";
import { listAttempts, listPuzzles } from "../../persist/db";
import { GameGlyph } from "../../ui/GameGlyph";

type Stat = { game: GameId; puzzles: number; attempts: number };

export function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    Promise.all([listPuzzles(), listAttempts()]).then(([puzzles, attempts]) => {
      setStats(
        GAMES.map((game) => {
          const ids = new Set(
            puzzles.filter((p) => p.game === game.id).map((p) => p.id),
          );
          return {
            game: game.id,
            puzzles: ids.size,
            attempts: attempts.filter((a) => ids.has(a.puzzleId)).length,
          };
        }),
      );
    });
  }, []);

  const totalP = stats.reduce((n, s) => n + s.puzzles, 0);

  return (
    <section>
      <header className="mesa__head">
        <p className="eyebrow">Marcas</p>
        <h2>Contagem local, sem ranking</h2>
        <p className="lede">
          {totalP === 0
            ? "Quando houver fases, os números aparecem aqui."
            : `${totalP} fase${totalP === 1 ? "" : "s"} no caderno.`}
        </p>
      </header>
      <ul className="marks">
        {stats.map((row) => {
          const game = GAMES.find((g) => g.id === row.game);
          return (
            <li key={row.game} className="mark">
              <GameGlyph game={row.game} className="glyph--sm" />
              <strong>{game?.name}</strong>
              <span className="mark__n">{row.puzzles}</span>
              <span className="muted">fases</span>
              <span className="mark__n">{row.attempts}</span>
              <span className="muted">tentativas</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
