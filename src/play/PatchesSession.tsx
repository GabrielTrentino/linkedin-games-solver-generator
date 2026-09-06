import { useEffect, useRef, useState } from "react";
import { patchesEngine } from "../engines/patches/engine";
import {
  initialPatchesState,
  parsePatchesBoard,
  rectCells,
  type PatchRect,
  type PatchesState,
} from "../engines/patches/model";
import { conflictingCells, isPatchesSolved, rectValid, usedCells } from "../engines/patches/rules";
import { finishAttempt } from "../persist/db";
import { PatchesBoardView, rectFromCorners } from "../ui/boards/PatchesBoard";
import { formatElapsed } from "./time";

type Props = {
  payload: string;
  attemptId: string;
  startedAt: number;
  onReplay: () => void;
};

export function PatchesSession({ payload, attemptId, startedAt, onReplay }: Props) {
  const board = parsePatchesBoard(payload);
  const [history, setHistory] = useState<PatchesState[]>(() => [initialPatchesState()]);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState<PatchRect | null>(null);
  const origin = useRef<number | null>(null);
  const solvedLock = useRef(false);
  const state = history[cursor];

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [solved]);

  useEffect(() => {
    if (solvedLock.current || !isPatchesSolved(board, state)) return;
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

  useEffect(() => {
    function up() {
      const start = origin.current;
      origin.current = null;
      setDraft((current) => {
        if (current && start != null) {
          const used = usedCells(board, history[cursor].rects);
          for (const at of rectCells(board, current)) used.delete(at);
          if (rectValid(board, current, used) == null) {
            setHistory((prev) => [...prev.slice(0, cursor + 1), { rects: [...history[cursor].rects, current] }]);
            setCursor((c) => c + 1);
          }
        }
        return null;
      });
    }
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [board, cursor, history]);

  function push(next: PatchesState) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  function onDown(at: number) {
    if (solved) return;
    const owner = state.rects.findIndex((rect) => rectCells(board, rect).includes(at));
    if (owner >= 0) {
      push({ rects: state.rects.filter((_, i) => i !== owner) });
      return;
    }
    origin.current = at;
    setDraft(rectFromCorners(board, at, at));
  }

  function onMove(at: number) {
    if (origin.current == null || solved) return;
    setDraft(rectFromCorners(board, origin.current, at));
  }

  const issues = patchesEngine.validate(
    {
      game: "patches",
      seed: "",
      difficulty: "easy",
      generatorVersion: "patches-1",
      payload,
    },
    state,
  );

  return (
    <>
      <PatchesBoardView
        board={board}
        rects={state.rects}
        draft={draft}
        conflicts={conflictingCells(board, state)}
        disabled={solved}
        onDown={onDown}
        onMove={onMove}
      />
      <div className="play-tools">
        <button type="button" disabled={cursor === 0 || solved} onClick={() => setCursor((c) => c - 1)}>
          Desfazer
        </button>
        <button type="button" disabled={solved} onClick={() => push(initialPatchesState())}>
          Limpar
        </button>
        <button type="button" disabled>
          Dica
        </button>
        <span className="timer" aria-live="polite">
          {formatElapsed((stoppedAt ?? now) - startedAt)}
        </span>
      </div>
      {issues.length > 0 ? <p className="banner banner--err">{issues[0].message}</p> : null}
      {solved ? (
        <div className="banner">
          <p>
            Resolvido em {formatElapsed((stoppedAt ?? now) - startedAt)}. A mesma seed pode ser
            jogada de novo.
          </p>
          <button className="ghost" type="button" onClick={onReplay}>
            Jogar de novo
          </button>
        </div>
      ) : (
        <p className="lede">
          Arraste a partir de uma pista para cobrir o retângulo. O número é a área. □ quadrado, ▯
          alto, ▭ largo. Clique num retalho para desfazer.
        </p>
      )}
    </>
  );
}
