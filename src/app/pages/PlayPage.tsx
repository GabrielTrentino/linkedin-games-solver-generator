import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES } from "../../engines/core/types";
import { parseSudokuBoard } from "../../engines/mini-sudoku/model";
import { parseBoard as parseQueens } from "../../engines/queens/model";
import { parseTangoBoard } from "../../engines/tango/model";
import { getPuzzle, startAttempt, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { QueensSession } from "../../play/QueensSession";
import { SudokuSession } from "../../play/SudokuSession";
import { TangoSession } from "../../play/TangoSession";
import { GameGlyph } from "../../ui/GameGlyph";

function isQueensPayload(payload: string) {
  try {
    parseQueens(payload);
    return true;
  } catch {
    return false;
  }
}

function isTangoPayload(payload: string) {
  try {
    parseTangoBoard(payload);
    return true;
  } catch {
    return false;
  }
}

function isSudokuPayload(payload: string) {
  try {
    parseSudokuBoard(payload);
    return true;
  } catch {
    return false;
  }
}

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
          Voltar às marcas
        </Link>
      </div>
    );
  }

  const game = GAMES.find((g) => g.id === puzzle.game);
  const diff = DIFFICULTIES.find((d) => d.id === puzzle.difficulty);
  const queensReady = puzzle.game === "queens" && isQueensPayload(puzzle.payload);
  const tangoReady = puzzle.game === "tango" && isTangoPayload(puzzle.payload);
  const sudokuReady = puzzle.game === "mini-sudoku" && isSudokuPayload(puzzle.payload);

  async function replay() {
    if (!puzzleId) return;
    const row = await startAttempt(puzzleId);
    setAttempt(row);
  }

  const title = queensReady
    ? "Coloque as coroas"
    : tangoReady
      ? "Equilibre sóis e luas"
      : sudokuReady
        ? "Preencha 1 a 6"
        : "Tabuleiro ainda em construção";

  return (
    <section className="play-page">
      <header className="play-page__meta">
        <GameGlyph game={puzzle.game} className="glyph--sm" />
        <div>
          <p className="eyebrow">{game?.name}</p>
          <h2>{title}</h2>
          <p className="lede">
            Seed <code>{puzzle.seed}</code> · {diff?.name} · gerador{" "}
            <code>{puzzle.generatorVersion}</code>
            {" · "}
            <Link className="text-link" to={`/game/${puzzle.game}`}>
              Caderno
            </Link>
          </p>
        </div>
      </header>

      {queensReady && attempt ? (
        <QueensSession
          key={attempt.id}
          payload={puzzle.payload}
          attemptId={attempt.id}
          startedAt={attempt.startedAt}
          onReplay={() => void replay()}
        />
      ) : tangoReady && attempt ? (
        <TangoSession
          key={attempt.id}
          payload={puzzle.payload}
          attemptId={attempt.id}
          startedAt={attempt.startedAt}
          onReplay={() => void replay()}
        />
      ) : sudokuReady && attempt ? (
        <SudokuSession
          key={attempt.id}
          payload={puzzle.payload}
          attemptId={attempt.id}
          startedAt={attempt.startedAt}
          onReplay={() => void replay()}
        />
      ) : (
        <>
          <div className="board-stub" role="img" aria-label="Tabuleiro placeholder">
            {Array.from({ length: 36 }, (_, i) => (
              <span key={i} className="board-stub__cell" />
            ))}
            <p className="board-stub__stamp">Este jogo entra numa fase seguinte</p>
          </div>
          <p className="lede">Por agora Queens, Tango e Mini Sudoku estão jogáveis.</p>
        </>
      )}
    </section>
  );
}
