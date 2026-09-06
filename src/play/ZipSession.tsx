import { useEffect, useRef, useState } from "react";
import { zipEngine } from "../engines/zip/engine";
import {
  hasWall,
  initialZipState,
  parseZipBoard,
  startCell,
  type ZipState,
} from "../engines/zip/model";
import { conflictingCells, isZipSolved } from "../engines/zip/rules";
import { finishAttempt } from "../persist/db";
import { ZipBoardView } from "../ui/boards/ZipBoard";
import { formatElapsed } from "./time";

type Props = {
  payload: string;
  attemptId: string;
  startedAt: number;
  onReplay: () => void;
};

export function ZipSession({ payload, attemptId, startedAt, onReplay }: Props) {
  const board = parseZipBoard(payload);
  const [history, setHistory] = useState<ZipState[]>(() => [initialZipState()]);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [pathView, setPathView] = useState<number[]>([]);
  const solvedLock = useRef(false);
  const drawing = useRef(false);
  const live = useRef<number[]>([]);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;
  const committed = history[cursor].path;
  const state: ZipState = { path: pathView.length || drawing.current ? pathView : committed };

  useEffect(() => {
    setPathView(committed);
    live.current = committed;
  }, [committed, cursor]);

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [solved]);

  useEffect(() => {
    if (solvedLock.current || !isZipSolved(board, { path: live.current })) return;
    const finishedAt = Date.now();
    solvedLock.current = true;
    setStoppedAt(finishedAt);
    setSolved(true);
    void finishAttempt(attemptId, {
      elapsedMs: finishedAt - startedAt,
      completed: true,
      finalState: JSON.stringify({ path: live.current }),
    });
  }, [attemptId, board, startedAt, pathView]);

  useEffect(() => {
    function up() {
      if (!drawing.current) return;
      drawing.current = false;
      const next = live.current.slice();
      const c = cursorRef.current;
      setHistory((prev) => [...prev.slice(0, c + 1), { path: next }]);
      setCursor(c + 1);
    }
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  function stepTo(at: number) {
    if (solved) return;
    const path = live.current;
    if (path.length === 0) {
      if (at !== startCell(board)) return;
      live.current = [at];
      setPathView([at]);
      return;
    }
    const last = path[path.length - 1];
    if (at === last) return;
    if (path.length >= 2 && at === path[path.length - 2]) {
      const next = path.slice(0, -1);
      live.current = next;
      setPathView(next);
      return;
    }
    if (path.includes(at)) return;
    if (hasWall(board, last, at)) return;
    const r = Math.floor(last / board.size);
    const c = last % board.size;
    const rr = Math.floor(at / board.size);
    const cc = at % board.size;
    if (Math.abs(r - rr) + Math.abs(c - cc) !== 1) return;
    const next = [...path, at];
    live.current = next;
    setPathView(next);
  }

  function onDown(at: number) {
    if (solved) return;
    drawing.current = true;
    if (at === startCell(board)) {
      live.current = [at];
      setPathView([at]);
      return;
    }
    live.current = history[cursor].path.slice();
    stepTo(at);
  }

  function push(next: ZipState) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
    live.current = next.path;
    setPathView(next.path);
  }

  const shown = { path: live.current };
  const issues = zipEngine.validate(
    {
      game: "zip",
      seed: "",
      difficulty: "easy",
      generatorVersion: "zip-1",
      payload,
    },
    shown,
  );

  return (
    <>
      <ZipBoardView
        board={board}
        path={shown.path}
        conflicts={conflictingCells(board, shown)}
        disabled={solved}
        onDown={onDown}
        onHover={(at) => {
          if (drawing.current) stepTo(at);
        }}
      />
      <div className="play-tools">
        <button type="button" disabled={cursor === 0 || solved} onClick={() => setCursor((c) => c - 1)}>
          Desfazer
        </button>
        <button type="button" disabled={solved} onClick={() => push(initialZipState())}>
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
          Arraste a partir do 1. Cubra todas as casas, na ordem dos números, sem atravessar
          paredes.
        </p>
      )}
    </>
  );
}
