import { useCallback, useRef, useState, type KeyboardEvent } from "react";

/**
 * Roving tabindex para grades: só uma casa entra na ordem do Tab, e as setas
 * movem o foco dentro do tabuleiro. Home/End vão ao começo e fim da linha;
 * Ctrl+Home/Ctrl+End, ao começo e fim da grade.
 */
export function useRovingGrid(rows: number, cols: number) {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLElement | null>>([]);
  const count = rows * cols;
  const current = Math.min(active, count - 1);

  const moveTo = useCallback(
    (at: number) => {
      const next = Math.max(0, Math.min(count - 1, at));
      setActive(next);
      refs.current[next]?.focus();
    },
    [count],
  );

  function onKeyDown(event: KeyboardEvent<HTMLElement>, at: number) {
    const row = Math.floor(at / cols);
    const col = at % cols;
    let target: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        target = col < cols - 1 ? at + 1 : at;
        break;
      case "ArrowLeft":
        target = col > 0 ? at - 1 : at;
        break;
      case "ArrowDown":
        target = row < rows - 1 ? at + cols : at;
        break;
      case "ArrowUp":
        target = row > 0 ? at - cols : at;
        break;
      case "Home":
        target = event.ctrlKey ? 0 : row * cols;
        break;
      case "End":
        target = event.ctrlKey ? count - 1 : row * cols + cols - 1;
        break;
      default:
        return false;
    }
    event.preventDefault();
    moveTo(target);
    return true;
  }

  function cellProps(at: number) {
    return {
      ref: (el: HTMLElement | null) => {
        refs.current[at] = el;
      },
      tabIndex: at === current ? 0 : -1,
      onFocus: () => setActive(at),
    };
  }

  return { active: current, activate: setActive, onKeyDown, cellProps };
}
