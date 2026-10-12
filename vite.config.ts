import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` gera caminhos relativos para scripts, CSS e o Web Worker.
// Assim o mesmo build funciona em `usuario.github.io/<repo>/`, num domínio
// próprio ou aberto direto de `dist/`, sem depender do nome do repositório.
// O roteamento usa HashRouter (ver src/main.tsx), então o GitHub Pages
// nunca precisa reescrever rotas.
export default defineConfig({
  base: "./",
  plugins: [react()],
  worker: {
    format: "es",
  },
});
