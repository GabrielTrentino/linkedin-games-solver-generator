import { useEffect, useRef, useState } from "react";
import { tangoEngine } from "../engines/tango/engine";
import {
  initialTangoState,
  parseTangoBoard,
  type TangoState,
} from "../engines/tango/model";
import { conflictingCells, isTangoSolved } from "../engines/tango/rules";
import { finishAttempt } from "../persist/db";
import { TangoBoard } from "../ui/boards/TangoBoard";
import { formatElapsed } from "./time";

type Props = {
  payload: string;
  attemptId: string;
  startedAt: number;
  onReplay: () => void;
};

function clone(state: TangoState): TangoState {
  return { cells: state.cells.slice() };
}

export function TangoSession({ payload, attemptId, startedAt, onReplay }: Props) {
  const board = parseTangoBoard(payload);
  const [history, setHistory] = useState<TangoState[]>(() => [initialTangoState(board)]);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const solvedLock = useRef(false);
  const conflictTimers = useRef<Map<number, number>>(new Map());
  const paintedRef = useRef<Set<number>>(new Set());
  const [paintedConflicts, setPaintedConflicts] = useState<Set<number>>(() => new Set());
  const state = history[cursor];
  paintedRef.current = paintedConflicts;

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [solved]);

  useEffect(() => {
    if (solvedLock.current || !isTangoSolved(board, state)) return;
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

  function push(next: TangoState) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  function onCycle(at: number) {
    if (solved || board.givens[at] != null) return;
    push(tangoEngine.applyMove(clone(history[cursor]), { at }));
  }

  const liveConflicts = conflictingCells(board, state);
  const liveKey = [...liveConflicts].sort((a, b) => a - b).join(",");

  useEffect(() => {
    const live = new Set(liveKey ? liveKey.split(",").map(Number) : []);

    setPaintedConflicts((prev) => {
      let changed = false;
      const next = new Set<number>();
      for (const at of prev) {
        if (live.has(at)) next.add(at);
        else changed = true;
      }
      return changed ? next : prev;
    });

    for (const [at, tid] of conflictTimers.current) {
      if (!live.has(at)) {
        window.clearTimeout(tid);
        conflictTimers.current.delete(at);
      }
    }

    for (const at of live) {
      if (paintedRef.current.has(at) || conflictTimers.current.has(at)) continue;
      const tid = window.setTimeout(() => {
        conflictTimers.current.delete(at);
        setPaintedConflicts((prev) => {
          if (prev.has(at)) return prev;
          const next = new Set(prev);
          next.add(at);
          return next;
        });
      }, 1500);
      conflictTimers.current.set(at, tid);
    }
  }, [liveKey]);

  useEffect(() => {
    return () => {
      for (const tid of conflictTimers.current.values()) window.clearTimeout(tid);
    };
  }, []);
  const issues = tangoEngine.validate(
    {
      game: "tango",
      seed: "",
      difficulty: "easy",
      generatorVersion: "tango-1",
      payload,
    },
    state,
  );

  return (
    <>
      <TangoBoard
        board={board}
        cells={state.cells}
        conflicts={paintedConflicts}
        disabled={solved}
        onCycle={onCycle}
      />
      <div className="play-tools">
        <button type="button" disabled={cursor === 0 || solved} onClick={() => setCursor((c) => c - 1)}>
          Desfazer
        </button>
        <button
          type="button"
          disabled={solved}
          onClick={() => push(initialTangoState(board))}
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
          Clique cicla vazio → sol → lua. Cada linha e coluna leva 3 de cada, sem três iguais
          seguidos. = iguais, × diferentes.
        </p>
      )}
    </>
  );
}
