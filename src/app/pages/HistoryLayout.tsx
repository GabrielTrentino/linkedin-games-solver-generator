import { Link, NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { GAMES, isGameId } from "../../engines/core/types";

export function HistoryLayout() {
  const { gameId } = useParams();
  const { pathname } = useLocation();
  const game = isGameId(gameId) ? GAMES.find((g) => g.id === gameId) : undefined;

  if (!game) {
    return (
      <div className="empty">
        <h2>Jogo não encontrado</h2>
        <Link className="text-link" to="/">
          Voltar às marcas
        </Link>
      </div>
    );
  }

  return (
    <section>
      <header className="mesa__head">
        <p className="eyebrow">
          <Link className="text-link" to="/">
            Jogos
          </Link>
          {" / "}
          {game.name}
        </p>
        <h2>{game.name}</h2>
        <p className="lede">{game.blurb}</p>
      </header>
      <nav className="subnav" aria-label={game.name}>
        <NavLink
          to={`/game/${game.id}`}
          end
          className={() =>
            pathname === `/game/${game.id}` || pathname.includes("/fase/") ? "is-on" : ""
          }
        >
          Lista
        </NavLink>
        <NavLink
          to={`/game/${game.id}/tempos`}
          className={({ isActive }) => (isActive ? "is-on" : "")}
        >
          Tempos
        </NavLink>
        <NavLink
          to={`/game/${game.id}/nova`}
          className={({ isActive }) => (isActive ? "is-on" : "")}
        >
          Nova fase
        </NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
