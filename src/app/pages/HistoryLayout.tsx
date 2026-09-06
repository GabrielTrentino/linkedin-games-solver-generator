import { NavLink, Outlet } from "react-router-dom";

export function HistoryLayout() {
  return (
    <section>
      <header className="mesa__head">
        <p className="eyebrow">Caderno</p>
        <h2>Fases deste navegador</h2>
      </header>
      <nav className="subnav" aria-label="Caderno">
        <NavLink to="/history" end className={({ isActive }) => (isActive ? "is-on" : "")}>
          Lista
        </NavLink>
        <NavLink to="/history/tempos" className={({ isActive }) => (isActive ? "is-on" : "")}>
          Tempos
        </NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
