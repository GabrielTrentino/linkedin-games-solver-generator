import { useEffect, useMemo, useRef, useState } from "react";
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
  const board = useMemo(() => parsePatchesBoard(payload), [payload]);
  const [history, setHistory] = useState<PatchesState[]>(() => [initialPatchesState()]);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState<PatchRect | null>(null);
  const origin = useRef<number | null>(null);
  const draftRef = useRef<PatchRect | null>(null);
  const cursorRef = useRef(0);
  const historyRef = useRef(history);
  const solvedLock = useRef(false);
  const state = history[cursor];
  cursorRef.current = cursor;
  historyRef.current = history;
  draftRef.current = draft;

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
      const current = draftRef.current;
      origin.current = null;
      draftRef.current = null;
      setDraft(null);
      if (!current || start == null) return;

      const c = cursorRef.current;
      const rects = historyRef.current[c].rects;
      const used = usedCells(board, rects);
      if (rectValid(board, current, used) != null) return;

      setHistory((prev) => [...prev.slice(0, c + 1), { rects: [...rects, current] }]);
      setCursor(c + 1);
    }
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [board]);

  function push(next: PatchesState) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  function onDown(at: number) {
    if (solved) return;
    const owner = state.rects.findIndex((rect) => rectCells(board, rect).includes(at));
    if (owner >= 0) {
      origin.current = null;
      draftRef.current = null;
      setDraft(null);
      push({ rects: state.rects.filter((_, i) => i !== owner) });
      return;
    }
    origin.current = at;
    const next = rectFromCorners(board, at, at);
    draftRef.current = next;
    setDraft(next);
  }

  function onMove(at: number) {
    if (origin.current == null || solved) return;
    const next = rectFromCorners(board, origin.current, at);
    draftRef.current = next;
    setDraft(next);
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
