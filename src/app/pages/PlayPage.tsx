import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES } from "../../engines/core/types";
import { parseBoard } from "../../engines/queens/model";
import { getPuzzle, startAttempt, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { QueensSession } from "../../play/QueensSession";
import { GameGlyph } from "../../ui/GameGlyph";

export function PlayPage() {
  const { puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState<PuzzleRow | null | undefined>(undefined);
  const [attempt, setAttempt] = useState<AttemptRow | null>(null);

  useEffect(() => {
    if (!puzzleId) return;
    let cancelled = false;
    getPuzzle(puzzleId).then((row) => {
      if (!cancelled) setPuzzle(row ?? null);
    });
    startAttempt(puzzleId).then((row) => {
      if (!cancelled) setAttempt(row);
    });
    return () => {
      cancelled = true;
    };
  }, [puzzleId]);

  if (puzzle === undefined || (puzzle && !attempt)) {
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
  const queensReady =
    puzzle.game === "queens" &&
    (() => {
      try {
        parseBoard(puzzle.payload);
        return true;
      } catch {
        return false;
      }
    })();
  const playable = queensReady && attempt;

  return (
    <section className="play-page">
      <header className="play-page__meta">
        <GameGlyph game={puzzle.game} className="glyph--sm" />
        <div>
          <p className="eyebrow">{game?.name}</p>
          <h2>{playable ? "Coloque as coroas" : "Tabuleiro ainda em construção"}</h2>
          <p className="lede">
            Seed <code>{puzzle.seed}</code> · {diff?.name} · gerador{" "}
            <code>{puzzle.generatorVersion}</code>
          </p>
        </div>
      </header>

      {playable ? (
        <QueensSession
          payload={puzzle.payload}
          attemptId={attempt.id}
          startedAt={attempt.startedAt}
        />
      ) : (
        <>
          <div className="board-stub" role="img" aria-label="Tabuleiro placeholder">
            {Array.from({ length: 36 }, (_, i) => (
              <span key={i} className="board-stub__cell" />
            ))}
            <p className="board-stub__stamp">Este jogo entra numa fase seguinte</p>
          </div>
          <p className="lede">Por agora só Queens está jogável.</p>
        </>
      )}
    </section>
  );
}
