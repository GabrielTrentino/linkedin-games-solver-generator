import { NavLink, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Marcas", match: (path: string) => path === "/" || path.startsWith("/game/") },
  { to: "/mesa", label: "Mesa", match: (path: string) => path === "/mesa" },
  { to: "/settings", label: "Ajustes", match: (path: string) => path === "/settings" },
];

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="shell">
      <aside className="spine">
        <p className="spine__mark">Oficina</p>
        <h1 className="spine__title">Lógica local</h1>
        <p className="spine__note">Cinco jogos. Sem dia. Sem nuvem.</p>
        <nav className="spine__nav" aria-label="Principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={() =>
                link.match(pathname) ? "spine__link is-active" : "spine__link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="sheet">
        <Outlet />
      </main>
    </div>
  );
}
