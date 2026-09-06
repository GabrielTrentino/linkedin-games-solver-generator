import type { GameId } from "../engines/core/types";

type Props = { game: GameId; className?: string };

export function GameGlyph({ game, className }: Props) {
  return (
    <div className={`glyph ${className ?? ""}`} data-game={game} aria-hidden>
      {game === "queens" && (
        <svg viewBox="0 0 40 40">
          <rect x="1" y="1" width="12" height="24" fill="#7BA3C9" />
          <rect x="13" y="1" width="14" height="12" fill="#D4A574" />
          <rect x="27" y="1" width="12" height="18" fill="#8BB89A" />
          <rect x="13" y="13" width="14" height="26" fill="#C97B7B" />
          <rect x="1" y="25" width="12" height="14" fill="#B7A3D4" />
          <rect x="27" y="19" width="12" height="20" fill="#E0C56E" />
          <circle cx="7" cy="9" r="2.2" fill="#1A2744" />
        </svg>
      )}
      {game === "tango" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" fill="#F4F7FA" />
          <g stroke="#1A2744" strokeWidth="0.6" fill="none">
            {[8, 16, 24, 32].map((n) => (
              <path key={n} d={`M${n} 2 V38 M2 ${n} H38`} />
            ))}
          </g>
          <circle cx="12" cy="12" r="3.2" fill="#C45C26" />
          <circle cx="20" cy="12" r="3.2" fill="#1A2744" />
          <circle cx="28" cy="20" r="3.2" fill="#C45C26" />
          <text x="12" y="30" fontSize="7" fill="#1A2744" textAnchor="middle">
            =
          </text>
          <text x="28" y="30" fontSize="7" fill="#1A2744" textAnchor="middle">
            ×
          </text>
        </svg>
      )}
      {game === "mini-sudoku" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" fill="#F4F7FA" />
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={2 + c * 6}
                y={2 + r * 6}
                width="5.4"
                height="5.4"
                fill={c < 3 && r < 2 ? "#DCE8F0" : "#F4F7FA"}
                stroke="#1A2744"
                strokeWidth="0.4"
              />
            )),
          )}
          <text x="5.5" y="12" fontSize="5" fill="#1A2744">
            4
          </text>
          <text x="17.5" y="24" fontSize="5" fill="#1A2744">
            1
          </text>
          <text x="29.5" y="36" fontSize="5" fill="#1A2744">
            6
          </text>
        </svg>
      )}
      {game === "zip" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" fill="#F4F7FA" />
          <path
            d="M8 32 H20 V20 H32 V8"
            fill="none"
            stroke="#C45C26"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="8" cy="32" r="3" fill="#1A2744" />
          <circle cx="32" cy="8" r="3" fill="#1A2744" />
          <text x="8" y="35.2" fontSize="4" fill="#F4F7FA" textAnchor="middle">
            1
          </text>
          <text x="32" y="11.2" fontSize="4" fill="#F4F7FA" textAnchor="middle">
            4
          </text>
        </svg>
      )}
      {game === "patches" && (
        <svg viewBox="0 0 40 40">
          <rect x="1" y="1" width="18" height="12" fill="#8BB89A" stroke="#1A2744" />
          <rect x="19" y="1" width="20" height="24" fill="#D4A574" stroke="#1A2744" />
          <rect x="1" y="13" width="18" height="26" fill="#7BA3C9" stroke="#1A2744" />
          <rect x="19" y="25" width="20" height="14" fill="#E0C56E" stroke="#1A2744" />
          <text x="10" y="9" fontSize="5" fill="#1A2744" textAnchor="middle">
            6
          </text>
          <text x="29" y="15" fontSize="5" fill="#1A2744" textAnchor="middle">
            12
          </text>
        </svg>
      )}
    </div>
  );
}
