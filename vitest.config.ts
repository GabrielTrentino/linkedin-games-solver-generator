import { defineConfig } from "vitest/config";

// Config de teste separada da config do Vite: o build de produção não
// depende dos tipos do Vitest.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
