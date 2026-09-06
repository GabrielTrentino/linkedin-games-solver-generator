import { Link } from "react-router-dom";
import { formatElapsed, formatWhen } from "../../play/time";

export type AttemptRecord = {
  id: string;
  seed: string;
  puzzleId: string;
  startedAt: number;
  elapsedMs: number;
  completed: boolean;
};

type Props = {
  rows: AttemptRecord[];
  gameId: string;
  showSeed?: boolean;
};

export function AttemptsTable({ rows, gameId, showSeed = true }: Props) {
  if (rows.length === 0) {
    return <p className="lede">Nenhum registro ainda.</p>;
  }

  return (
    <div className="records">
      <table>
        <thead>
          <tr>
            {showSeed ? <th>Seed</th> : null}
            <th>Início</th>
            <th>Tempo</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {showSeed ? (
                <td>
                  <Link className="text-link" to={`/game/${gameId}/fase/${row.puzzleId}`}>
                    {row.seed}
                  </Link>
                </td>
              ) : null}
              <td>{formatWhen(row.startedAt)}</td>
              <td className="records__time">
                {row.completed ? formatElapsed(row.elapsedMs) : "—"}
              </td>
              <td>{row.completed ? "Resolvida" : "Não concluída"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
