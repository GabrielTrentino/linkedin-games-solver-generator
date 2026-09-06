import { useEffect, useRef, useState } from "react";
import { queensEngine } from "../engines/queens/engine";
import { emptyState, parseBoard, type QueensState } from "../engines/queens/model";
import { autoMarkFromCrown, conflictingCells, isQueensSolved } from "../engines/queens/rules";
import { finishAttempt } from "../persist/db";
import { loadSettings } from "../persist/settings";
import { QueensBoard } from "../ui/boards/QueensBoard";

type Props = {
  payload: string;
  attemptId: string;
  startedAt: number;
};

function clone(state: QueensState): QueensState {
  return { cells: state.cells.slice() };
}

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function QueensSession({ payload, attemptId, startedAt }: Props) {
  const board = parseBoard(payload);
  const settings = loadSettings();
  const [history, setHistory] = useState<QueensState[]>(() => [emptyState(board.size)]);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const solvedLock = useRef(false);

  const [draft, setDraft] = useState<QueensState | null>(null);

  const state = draft ?? history[cursor];

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [solved]);

  useEffect(() => {
    if (solvedLock.current || !isQueensSolved(board, state)) return;
    const finishedAt = Date.now();
    solvedLock.current = true;
    setStoppedAt(finishedAt);
    setSolved(true);
    void finishAttempt(attemptId, {
      elapsedMs: finishedAt - startedAt,
      completed: true,
      finalState: JSON.stringify(state),
    });
  }, [attemptId, board, startedAt, state]);

  function push(next: QueensState) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  function onCycle(at: number) {
    if (solved) return;
    setDraft(null);
    let next = queensEngine.applyMove(clone(history[cursor]), { at });
    if (settings.autoMarkQueens && next.cells[at] === "crown") {
      next = { cells: autoMarkFromCrown(board, next.cells, at) };
    }
    push(next);
  }

  function applyMarks(indices: number[], commit: boolean) {
    if (solved) return;
    const base = clone(history[cursor]);
    let changed = false;
    for (const at of indices) {
      if (base.cells[at] !== "empty") continue;
      base.cells[at] = "mark";
      changed = true;
    }
    if (!changed) {
      setDraft(null);
      return;
    }
    if (commit) {
      setDraft(null);
      push(base);
    } else {
      setDraft(base);
    }
  }

  const conflicts = conflictingCells(board, state);
  const issues = queensEngine.validate({
    game: "queens",
    seed: "",
    difficulty: "easy",
    generatorVersion: "queens-1",
    payload,
  }, state);

  return (
    <>
      <QueensBoard
        board={board}
        cells={state.cells}
        conflicts={conflicts}
        disabled={solved}
        onCycle={onCycle}
        onMarkPreview={(cells) => applyMarks(cells, false)}
        onMarkCommit={(cells) => applyMarks(cells, true)}
      />
      <div className="play-tools">
        <button type="button" disabled={cursor === 0 || solved} onClick={() => setCursor((c) => c - 1)}>
          Desfazer
        </button>
        <button
          type="button"
          disabled={solved}
          onClick={() => push(emptyState(board.size))}
        >
          Limpar
        </button>
        <button type="button" disabled>
          Dica
        </button>
        <span className="timer" aria-live="polite">
          {formatElapsed((stoppedAt ?? now) - startedAt)}
        </span>
      </div>
      {issues.length > 0 ? (
        <p className="banner banner--err">{issues[0].message}</p>
      ) : null}
      {solved ? (
        <p className="banner">Resolvido. A tentativa foi gravada no caderno.</p>
      ) : (
        <p className="lede">
          Clique cicla vazio → × → coroa. Arrastar pinta × nas casas vazias.
        </p>
      )}
    </>
  );
}
