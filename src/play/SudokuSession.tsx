import { useEffect, useRef, useState } from "react";
import { miniSudokuEngine } from "../engines/mini-sudoku/engine";
import {
  initialSudokuState,
  parseSudokuBoard,
  type SudokuCell,
  type SudokuState,
} from "../engines/mini-sudoku/model";
import { conflictingCells, isSudokuSolved } from "../engines/mini-sudoku/rules";
import { finishAttempt } from "../persist/db";
import { SudokuBoardView } from "../ui/boards/SudokuBoard";
import { formatElapsed } from "./time";

type Props = {
  payload: string;
  attemptId: string;
  startedAt: number;
  onReplay: () => void;
};

function clone(state: SudokuState): SudokuState {
  return { cells: state.cells.slice() };
}

export function SudokuSession({ payload, attemptId, startedAt, onReplay }: Props) {
  const board = parseSudokuBoard(payload);
  const [history, setHistory] = useState<SudokuState[]>(() => [initialSudokuState(board)]);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [solved, setSolved] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [digit, setDigit] = useState<SudokuCell>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const solvedLock = useRef(false);
  const state = history[cursor];

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [solved]);

  useEffect(() => {
    if (solvedLock.current || !isSudokuSolved(board, state)) return;
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
    function onKey(event: KeyboardEvent) {
      if (solved) return;
      if (event.key >= "1" && event.key <= "6") {
        const value = Number(event.key) as SudokuCell;
        setDigit(value);
        if (selected != null && !board.givens[selected]) {
          push(miniSudokuEngine.applyMove(clone(history[cursor]), { at: selected, value }));
        }
      }
      if (event.key === "0" || event.key === "Backspace" || event.key === "Delete") {
        setDigit(0);
        if (selected != null && !board.givens[selected]) {
          push(miniSudokuEngine.applyMove(clone(history[cursor]), { at: selected, value: 0 }));
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function push(next: SudokuState) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  function onCell(at: number) {
    if (solved || board.givens[at]) return;
    setSelected(at);
    const value = state.cells[at] === digit ? 0 : digit;
    push(miniSudokuEngine.applyMove(clone(state), { at, value }));
  }

  const issues = miniSudokuEngine.validate(
    {
      game: "mini-sudoku",
      seed: "",
      difficulty: "easy",
      generatorVersion: "mini-sudoku-1",
      payload,
    },
    state,
  );

  return (
    <>
      <SudokuBoardView
        board={board}
        cells={state.cells}
        conflicts={conflictingCells(board, state)}
        selected={selected}
        disabled={solved}
        onCell={onCell}
      />
      <div className="digit-pad" role="toolbar" aria-label="Dígitos">
        {([1, 2, 3, 4, 5, 6, 0] as SudokuCell[]).map((d) => (
          <button
            key={d}
            type="button"
            className={digit === d ? "is-on" : ""}
            disabled={solved}
            onClick={() => setDigit(d)}
          >
            {d === 0 ? "Apagar" : d}
          </button>
        ))}
      </div>
      <div className="play-tools">
        <button type="button" disabled={cursor === 0 || solved} onClick={() => setCursor((c) => c - 1)}>
          Desfazer
        </button>
        <button type="button" disabled={solved} onClick={() => push(initialSudokuState(board))}>
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
          Escolha um dígito (1–6 ou teclado) e clique na casa. Cada linha, coluna e caixa 2×3 leva
          1 a 6 uma vez.
        </p>
      )}
    </>
  );
}
