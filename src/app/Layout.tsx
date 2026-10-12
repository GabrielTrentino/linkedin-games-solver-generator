import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { checkStorage, type StorageStatus } from "../persist/db";
import { GAMES } from "../engines/core/types";

const links = [
  { to: "/mesa", label: "Mesa", match: (path: string) => path === "/mesa" },
  { to: "/settings", label: "Ajustes", match: (path: string) => path === "/settings" },
];

const gameLinks = GAMES.map((game) => ({
  id: game.id,
  name: game.name,
  to: `/game/${game.id}`,
  match: (path: string) => path === `/game/${game.id}` || path.startsWith(`/game/${game.id}/`),
}));

export function Layout() {
  const { pathname } = useLocation();
  const [storage, setStorage] = useState<StorageStatus>({ ok: true });

  useEffect(() => {
    let cancelled = false;
    void checkStorage().then((status) => {
      if (!cancelled) setStorage(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="shell">
      {/* Com HashRouter, um href="#conteudo" trocaria a rota; o foco vai por script. */}
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById("conteudo")?.focus()}
      >
        Pular para o conteúdo
      </button>
      <aside className="spine">
        <p className="spine__mark">Oficina</p>
        <h1 className="spine__title">Lógica local</h1>
        <p className="spine__note">Cinco jogos. Sem dia. Sem nuvem.</p>
        <nav className="spine__nav" aria-label="Principal">
          <NavLink
            to="/"
            end
            aria-current={pathname === "/" ? "page" : undefined}
            className={() => (pathname === "/" ? "spine__link is-active" : "spine__link")}
          >
            Jogos
          </NavLink>
          <ul className="spine__sub" aria-label="Jogos">
            {gameLinks.map((game) => {
              const active = game.match(pathname);
              return (
                <li key={game.id}>
                  <NavLink
                    to={game.to}
                    aria-current={active ? "page" : undefined}
                    className={() => (active ? "spine__sublink is-active" : "spine__sublink")}
                  >
                    {game.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={() => (active ? "spine__link is-active" : "spine__link")}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="sheet" id="conteudo" tabIndex={-1}>
        {storage.ok ? null : (
          <div className="banner banner--err" role="alert">
            <p>
              <strong>Nada será salvo nesta aba.</strong> {storage.reason} Você pode jogar, mas fases,
              tempos e histórico somem ao fechar. Em janela anônima, abra o app numa janela normal.
            </p>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
