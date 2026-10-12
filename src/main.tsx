import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./app/App";
import { applyTheme } from "./app/theme";
import { loadSettings } from "./persist/settings";
import "./styles.css";

applyTheme(loadSettings().theme);

// HashRouter: as rotas ficam depois do `#`, então o GitHub Pages sempre
// serve o index.html e recarregar /#/mesa ou abrir um link direto funciona.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
