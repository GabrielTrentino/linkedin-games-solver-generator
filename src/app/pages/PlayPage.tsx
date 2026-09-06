import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES } from "../../engines/core/types";
import { getPuzzle, startAttempt, type PuzzleRow } from "../../persist/db";
import { GameGlyph } from "../../ui/GameGlyph";

export function PlayPage() {
  const { puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState<PuzzleRow | null | undefined>(undefined);

  useEffect(() => {
    if (!puzzleId) return;
    let cancelled = false;
    getPuzzle(puzzleId).then((row) => {
      if (!cancelled) setPuzzle(row ?? null);
    });
    startAttempt(puzzleId).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [puzzleId]);

  if (puzzle === undefined) {
    return <p className="lede">Abrindo a fase…</p>;
  }

  if (puzzle === null) {
    return (
      <div className="empty">
        <h2>Esta fase não está no caderno</h2>
        <p>O id não existe neste navegador. Gere outra na mesa ou importe um save.</p>
        <Link className="text-link" to="/">
          Voltar à mesa
        </Link>
      </div>
    );
  }

  const game = GAMES.find((g) => g.id === puzzle.game);
  const diff = DIFFICULTIES.find((d) => d.id === puzzle.difficulty);

  return (
    <section className="play-page">
      <header className="play-page__meta">
        <GameGlyph game={puzzle.game} className="glyph--sm" />
        <div>
          <p className="eyebrow">{game?.name}</p>
          <h2>Fase aberta, tabuleiro ainda em construção</h2>
          <p className="lede">
            Seed <code>{puzzle.seed}</code> · {diff?.name} · gerador{" "}
            <code>{puzzle.generatorVersion}</code>
          </p>
        </div>
      </header>

      <div className="board-stub" role="img" aria-label="Tabuleiro placeholder">
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} className="board-stub__cell" />
        ))}
        <p className="board-stub__stamp">Queens chega na fase 2</p>
      </div>

      <div className="play-tools">
        <button type="button" disabled>
          Desfazer
        </button>
        <button type="button" disabled>
          Limpar
        </button>
        <button type="button" disabled>
          Dica
        </button>
        <span className="timer" aria-label="Cronômetro">
          00:00
        </span>
      </div>
    </section>
  );
}
