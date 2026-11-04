import type { GameId } from "../engines/core/types";

type Props = { game: GameId; className?: string };

// Ícones desenhados na mesma linguagem dos tabuleiros: fundo papel, traço marinho,
// cores de região em tons pastel e o símbolo principal de cada jogo.
const INK = "#1a2744";
const PAPER = "#f3f7fa";
const COPPER = "#c45c26";

export function GameGlyph({ game, className }: Props) {
  return (
    <div className={`glyph ${className ?? ""}`} data-game={game} aria-hidden>
      {game === "queens" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" rx="7" fill={PAPER} />
          {/* regiões */}
          <path d="M3 3 H22 V14 H3 Z" fill="#8bb7d9" />
          <path d="M22 3 H37 V20 H22 Z" fill="#d4a574" />
          <path d="M3 14 H13 V25 H3 Z" fill="#8bb89a" />
          <path d="M13 14 H22 V25 H13 Z" fill="#d49aa0" />
          <path d="M22 20 H37 V37 H22 Z" fill="#e0c56e" />
          <path d="M3 25 H22 V37 H3 Z" fill="#b7a3d4" />
          <path d="M37 3 Z" fill="none" />
          {/* grade */}
          <path d="M3 3 H37 V37 H3 Z" fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" rx="2" />
          {/* coroa */}
          <path d="M12.5 17.5 L15 11.5 L18.5 15.5 L20.5 10.5 L22.5 15.5 L26 11.5 L28.5 17.5 Z" fill={INK} />
          <rect x="12.5" y="18.5" width="16" height="2.4" rx="0.8" fill={INK} />
        </svg>
      )}
      {game === "tango" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" rx="7" fill={PAPER} />
          {/* grade 2x2 */}
          <rect x="4" y="4" width="15" height="15" rx="2" fill="#f4d7b8" stroke={INK} strokeWidth="1.2" />
          <rect x="21" y="4" width="15" height="15" rx="2" fill="#fff" stroke={INK} strokeWidth="1.2" />
          <rect x="4" y="21" width="15" height="15" rx="2" fill="#fff" stroke={INK} strokeWidth="1.2" />
          <rect x="21" y="21" width="15" height="15" rx="2" fill="#d5deea" stroke={INK} strokeWidth="1.2" />
          {/* sol */}
          <circle cx="11.5" cy="11.5" r="3.6" fill={COPPER} />
          <g stroke={COPPER} strokeWidth="1.2" strokeLinecap="round">
            <path d="M11.5 5.2 V6.6 M11.5 16.4 V17.8 M5.2 11.5 H6.6 M16.4 11.5 H17.8" />
          </g>
          {/* lua */}
          <path d="M31.5 25.2 A5.6 5.6 0 1 0 35.6 33.6 A4.4 4.4 0 0 1 31.5 25.2 Z" fill={INK} />
          {/* = e × */}
          <path d="M8.5 30.5 H14.5 M8.5 33.5 H14.5" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M24 28.5 L29 33.5 M29 28.5 L24 33.5" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {game === "mini-sudoku" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" rx="7" fill={PAPER} />
          {/* caixa 2x3 destacada */}
          <rect x="3" y="3" width="18" height="12" fill="#dce8f0" />
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={3 + c * 6}
                y={3 + r * 6}
                width="6"
                height="6"
                fill="none"
                stroke={INK}
                strokeWidth="0.5"
              />
            )),
          )}
          <rect x="3" y="3" width="18" height="12" fill="none" stroke={INK} strokeWidth="1.4" />
          <rect x="21" y="3" width="18" height="12" fill="none" stroke={INK} strokeWidth="1.4" />
          <rect x="3" y="15" width="18" height="12" fill="none" stroke={INK} strokeWidth="1.4" />
          <rect x="21" y="15" width="18" height="12" fill="none" stroke={INK} strokeWidth="1.4" />
          <rect x="3" y="27" width="18" height="10" fill="none" stroke={INK} strokeWidth="1.4" />
          <rect x="21" y="27" width="18" height="10" fill="none" stroke={INK} strokeWidth="1.4" />
          <g fill={INK} fontFamily="Syne, sans-serif" fontWeight="800" fontSize="7.5" textAnchor="middle">
            <text x="6" y="12.6">4</text>
            <text x="18" y="24.6">1</text>
            <text x="30" y="36">6</text>
          </g>
        </svg>
      )}
      {game === "zip" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" rx="7" fill={PAPER} />
          <path
            d="M9 31 H17 V23 H31 V15 H23 V9"
            fill="none"
            stroke={COPPER}
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="9" cy="31" r="4" fill={INK} />
          <circle cx="23" cy="9" r="4" fill={INK} />
          <text x="9" y="32.6" fontSize="5.4" fontWeight="800" fill={PAPER} textAnchor="middle" fontFamily="IBM Plex Mono, monospace">
            1
          </text>
          <text x="23" y="10.6" fontSize="5.4" fontWeight="800" fill={PAPER} textAnchor="middle" fontFamily="IBM Plex Mono, monospace">
            4
          </text>
        </svg>
      )}
      {game === "patches" && (
        <svg viewBox="0 0 40 40">
          <rect width="40" height="40" rx="7" fill={PAPER} />
          <rect x="3" y="3" width="16" height="14" fill="#8bb89a" stroke={INK} strokeWidth="1.4" />
          <rect x="19" y="3" width="18" height="20" fill="#d4a574" stroke={INK} strokeWidth="1.4" />
          <rect x="3" y="17" width="16" height="20" fill="#7ba3c9" stroke={INK} strokeWidth="1.4" />
          <rect x="19" y="23" width="18" height="14" fill="#e0c56e" stroke={INK} strokeWidth="1.4" />
          <g fill={INK} fontFamily="IBM Plex Mono, monospace" fontWeight="800" fontSize="6.5" textAnchor="middle">
            <text x="11" y="12.5">6</text>
            <text x="28" y="15">12</text>
            <text x="11" y="30">8</text>
            <text x="28" y="33">6</text>
          </g>
        </svg>
      )}
    </div>
  );
}
