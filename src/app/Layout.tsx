import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Mesa" },
  { to: "/history", label: "Caderno" },
  { to: "/stats", label: "Marcas" },
  { to: "/settings", label: "Ajustes" },
];

export function Layout() {
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
              className={({ isActive }) =>
                isActive ? "spine__link is-active" : "spine__link"
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
