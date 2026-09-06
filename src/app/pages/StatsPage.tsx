import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GAMES, type GameId } from "../../engines/core/types";
import { listAttempts, listPuzzles } from "../../persist/db";
import { GameGlyph } from "../../ui/GameGlyph";

type Stat = { game: GameId; puzzles: number; attempts: number; wins: number };

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
            wins: attempts.filter((a) => ids.has(a.puzzleId) && a.completed).length,
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
        <h2>Escolha um jogo</h2>
        <p className="lede">
          {totalP === 0
            ? "Ainda não há fases. Abra Queens e gere a primeira."
            : `${totalP} fase${totalP === 1 ? "" : "s"} no caderno. Clique no jogo para ver tempos e prévias.`}
        </p>
      </header>
      <ul className="marks">
        {stats.map((row) => {
          const game = GAMES.find((g) => g.id === row.game);
          return (
            <li key={row.game}>
              <Link className="mark" to={`/game/${row.game}`}>
                <GameGlyph game={row.game} className="glyph--sm" />
                <strong>
                  {game?.name}
                  {game?.ready ? "" : " · em breve"}
                </strong>
                <span className="mark__n">{row.puzzles}</span>
                <span className="muted">fases</span>
                <span className="mark__n">{row.wins}</span>
                <span className="muted">resoluções</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
