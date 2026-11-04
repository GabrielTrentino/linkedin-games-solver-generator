import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GAMES, isGameId, type GameId } from "../../engines/core/types";
import { listAttempts, listPuzzles, type AttemptRow, type PuzzleRow } from "../../persist/db";
import { formatDateTime, formatElapsed, niceStep } from "../../play/time";
import { AttemptsTable } from "./AttemptsTable";

type Point = {
  at: number;
  startedAt: number;
  elapsedMs: number;
  seed: string;
  puzzleId: string;
  attemptId: string;
};

export function HistoryChartPage() {
  const { gameId } = useParams();
  const game: GameId | null = isGameId(gameId) ? gameId : null;
  const [puzzles, setPuzzles] = useState<PuzzleRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listPuzzles(), listAttempts()]).then(([p, a]) => {
      setPuzzles(p);
      setAttempts(a);
    });
  }, []);

  const points = useMemo(() => {
    if (!game) return [];
    const byId = new Map(puzzles.filter((p) => p.game === game).map((p) => [p.id, p]));
    const rows: Point[] = [];
    for (const attempt of attempts) {
      if (!attempt.completed) continue;
      const puzzle = byId.get(attempt.puzzleId);
      if (!puzzle) continue;
      rows.push({
        at: attempt.finishedAt ?? attempt.startedAt,
        startedAt: attempt.startedAt,
        elapsedMs: attempt.elapsedMs,
        seed: puzzle.seed,
        puzzleId: puzzle.id,
        attemptId: attempt.id,
      });
    }
    return rows.sort((a, b) => a.at - b.at);
  }, [attempts, game, puzzles]);

  if (!game) return null;

  if (points.length === 0) {
    return (
      <div className="empty">
        <h2>Nenhuma resolução ainda</h2>
        <p>Quando uma fase for concluída, o tempo entra neste gráfico. A mesma seed pode aparecer várias vezes.</p>
        <Link className="text-link" to={`/game/${game}`}>
          Voltar à lista
        </Link>
      </div>
    );
  }

  const pad = { top: 18, right: 22, bottom: 40, left: 62 };
  const width = 680;
  const height = 300;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // Eixo Y: tempo, com marcas e grades em passos redondos.
  const rawMax = Math.max(...points.map((p) => p.elapsedMs), 1000);
  const step = niceStep(rawMax);
  const maxY = Math.ceil(rawMax / step) * step;
  const yTicks: number[] = [];
  for (let t = 0; t <= maxY; t += step) yTicks.push(t);

  // Eixo X: número da partida (1 = primeira resolução), em ordem cronológica.
  const n = points.length;
  const xOf = (i: number) => (n === 1 ? pad.left + plotW / 2 : pad.left + (i / (n - 1)) * plotW);
  const yOf = (ms: number) => pad.top + (1 - ms / maxY) * plotH;
  const xTickEvery = Math.max(1, Math.ceil(n / 10));
  const xTicks = points.map((_, i) => i).filter((i) => i % xTickEvery === 0 || i === n - 1);

  const line = points.map((p, i) => `${xOf(i)},${yOf(p.elapsedMs)}`).join(" ");
  const active = hover != null ? points[hover] : null;
  const name = GAMES.find((g) => g.id === game)?.name;

  // Tooltip dentro do SVG: vai para a esquerda quando o ponto está perto da borda direita.
  const tip = hover != null ? { x: xOf(hover), y: yOf(points[hover].elapsedMs) } : null;
  const tipW = 176;
  const tipLeft = tip ? tip.x + tipW + 14 > width : false;

  return (
    <div className="chart">
      <svg
        className="chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Tempo de resolução de ${name}, por partida`}
      >
        {yTicks.map((t) => (
          <g key={`y-${t}`}>
            <line
              className="chart__grid"
              x1={pad.left}
              x2={width - pad.right}
              y1={yOf(t)}
              y2={yOf(t)}
            />
            <text className="chart__tick" x={pad.left - 10} y={yOf(t) + 4} textAnchor="end">
              {formatElapsed(t)}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <g key={`x-${i}`}>
            <line className="chart__grid chart__grid--x" x1={xOf(i)} x2={xOf(i)} y1={pad.top} y2={height - pad.bottom} />
            <text className="chart__tick" x={xOf(i)} y={height - pad.bottom + 18} textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}
        <line className="chart__axis" x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} />
        <line className="chart__axis" x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} />
        <text className="chart__label" x={width - pad.right} y={height - 6} textAnchor="end">
          partida
        </text>
        <text className="chart__label" x={6} y={pad.top - 4}>
          tempo
        </text>

        <polyline className="chart__line" points={line} />
        {points.map((p, i) => (
          <circle
            key={`${p.puzzleId}-${p.at}-${i}`}
            className={hover === i ? "chart__dot is-active" : "chart__dot"}
            cx={xOf(i)}
            cy={yOf(p.elapsedMs)}
            r={hover === i ? 6 : 4.5}
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          />
        ))}

        {tip && active ? (
          <g className="chart__tip" pointerEvents="none">
            <rect
              x={tipLeft ? tip.x - tipW - 12 : tip.x + 12}
              y={Math.max(pad.top, tip.y - 56)}
              width={tipW}
              height={58}
              rx={4}
            />
            <text x={tipLeft ? tip.x - tipW - 4 : tip.x + 20} y={Math.max(pad.top, tip.y - 56) + 18}>
              Partida {hover! + 1} · {formatElapsed(active.elapsedMs)}
            </text>
            <text
              className="chart__tip-sub"
              x={tipLeft ? tip.x - tipW - 4 : tip.x + 20}
              y={Math.max(pad.top, tip.y - 56) + 36}
            >
              {formatDateTime(active.startedAt)}
            </text>
            <text
              className="chart__tip-sub"
              x={tipLeft ? tip.x - tipW - 4 : tip.x + 20}
              y={Math.max(pad.top, tip.y - 56) + 50}
            >
              seed {active.seed}
            </text>
          </g>
        ) : null}
      </svg>

      <p className="lede">
        {active
          ? `Partida ${hover! + 1}: ${formatElapsed(active.elapsedMs)}, em ${formatDateTime(active.startedAt)}.`
          : "Cada ponto é uma resolução, em ordem de partida. Passe o mouse para ver data, hora e tempo."}
      </p>

      <h3>Registros</h3>
      <AttemptsTable
        gameId={game}
        rows={[...points]
          .slice()
          .reverse()
          .map((p) => ({
            id: p.attemptId,
            seed: p.seed,
            puzzleId: p.puzzleId,
            startedAt: p.startedAt,
            elapsedMs: p.elapsedMs,
            completed: true,
          }))}
      />
    </div>
  );
}
