import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { checkStorage, type StorageStatus } from "../persist/db";

const links = [
  { to: "/", label: "Marcas", match: (path: string) => path === "/" || path.startsWith("/game/") },
  { to: "/mesa", label: "Mesa", match: (path: string) => path === "/mesa" },
  { to: "/settings", label: "Ajustes", match: (path: string) => path === "/settings" },
];

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
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
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
