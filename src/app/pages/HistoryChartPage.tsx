import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GAMES, type GameId } from "../../engines/core/types";
import { listAttempts, listPuzzles, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { formatElapsed, formatWhen } from "../../play/time";

type Point = {
  at: number;
  elapsedMs: number;
  game: GameId;
  seed: string;
  puzzleId: string;
};

export function HistoryChartPage() {
  const [puzzles, setPuzzles] = useState<PuzzleRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [game, setGame] = useState<GameId | "all">("all");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listPuzzles(), listAttempts()]).then(([p, a]) => {
      setPuzzles(p);
      setAttempts(a);
    });
  }, []);

  const points = useMemo(() => {
    const byId = new Map(puzzles.map((p) => [p.id, p]));
    const rows: Point[] = [];
    for (const attempt of attempts) {
      if (!attempt.completed) continue;
      const puzzle = byId.get(attempt.puzzleId);
      if (!puzzle) continue;
      if (game !== "all" && puzzle.game !== game) continue;
      rows.push({
        at: attempt.finishedAt ?? attempt.startedAt,
        elapsedMs: attempt.elapsedMs,
        game: puzzle.game,
        seed: puzzle.seed,
        puzzleId: puzzle.id,
      });
    }
    return rows.sort((a, b) => a.at - b.at);
  }, [attempts, game, puzzles]);

  if (points.length === 0) {
    return (
      <div className="empty">
        <h2>Nenhuma resolução ainda</h2>
        <p>Quando uma fase for concluída, o tempo entra neste gráfico. A mesma seed pode aparecer várias vezes.</p>
        <Link className="text-link" to="/history">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const pad = { top: 16, right: 12, bottom: 36, left: 48 };
  const width = 640;
  const height = 280;
  const minX = points[0].at;
  const maxX = points[points.length - 1].at;
  const maxY = Math.max(...points.map((p) => p.elapsedMs), 1000);
  const spanX = Math.max(maxX - minX, 1);

  function xOf(at: number) {
    return pad.left + ((at - minX) / spanX) * (width - pad.left - pad.right);
  }
  function yOf(ms: number) {
    return pad.top + (1 - ms / maxY) * (height - pad.top - pad.bottom);
  }

  const line = points.map((p) => `${xOf(p.at)},${yOf(p.elapsedMs)}`).join(" ");
  const active = hover != null ? points[hover] : null;

  return (
    <div className="chart">
      <fieldset className="pills">
        <legend>Jogo</legend>
        <label className={game === "all" ? "pill is-on" : "pill"}>
          <input type="radio" name="chart-game" checked={game === "all"} onChange={() => setGame("all")} />
          Todos
        </label>
        {GAMES.map((item) => (
          <label key={item.id} className={game === item.id ? "pill is-on" : "pill"}>
            <input
              type="radio"
              name="chart-game"
              checked={game === item.id}
              onChange={() => setGame(item.id)}
            />
            {item.name}
          </label>
        ))}
      </fieldset>

      <svg
        className="chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Tempo de resolução ao longo das datas"
      >
        <line
          x1={pad.left}
          y1={height - pad.bottom}
          x2={width - pad.right}
          y2={height - pad.bottom}
          stroke="currentColor"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={height - pad.bottom}
          stroke="currentColor"
        />
        <text x={pad.left} y={12} fontSize="11" fill="currentColor">
          {formatElapsed(maxY)}
        </text>
        <text x={pad.left} y={height - 12} fontSize="11" fill="currentColor">
          {formatWhen(minX)}
        </text>
        <text x={width - pad.right} y={height - 12} fontSize="11" fill="currentColor" textAnchor="end">
          {formatWhen(maxX)}
        </text>
        <polyline fill="none" stroke="#c45c26" strokeWidth="2" points={line} />
        {points.map((p, i) => (
          <circle
            key={`${p.puzzleId}-${p.at}-${i}`}
            cx={xOf(p.at)}
            cy={yOf(p.elapsedMs)}
            r={hover === i ? 6 : 4}
            fill="#1a2744"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      <p className="lede">
        {active
          ? `${GAMES.find((g) => g.id === active.game)?.name} · seed ${active.seed} · ${formatElapsed(active.elapsedMs)} em ${formatWhen(active.at)}`
          : "Cada ponto é uma resolução. Passe o mouse para ver seed e horário."}
      </p>
    </div>
  );
}
