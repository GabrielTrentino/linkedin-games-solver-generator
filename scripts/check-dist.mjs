// Smoke do build de produção, sem navegador.
// Confere que dist/index.html existe, que todo asset referenciado usa caminho
// relativo (necessário para o GitHub Pages em subpasta) e que o arquivo existe.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const errors = [];

const indexPath = join(dist, "index.html");
if (!existsSync(indexPath)) {
  console.error("dist/index.html não existe. Rode `npm run build` antes.");
  process.exit(1);
}

const html = readFileSync(indexPath, "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((ref) => !/^(https?:)?\/\//.test(ref) && !ref.startsWith("data:") && !ref.startsWith("#"));

if (!refs.some((ref) => ref.endsWith(".js"))) {
  errors.push("index.html não referencia nenhum script do build.");
}

for (const ref of refs) {
  if (ref.startsWith("/")) {
    errors.push(`Caminho absoluto quebra no GitHub Pages: ${ref}`);
    continue;
  }
  const file = join(dist, ref.replace(/^\.\//, "").split(/[?#]/)[0]);
  if (!existsSync(file)) errors.push(`Asset referenciado não existe: ${ref}`);
}

const assets = existsSync(join(dist, "assets")) ? readdirSync(join(dist, "assets")) : [];
if (!assets.some((name) => /generate.*\.js$/.test(name))) {
  errors.push("O Web Worker de geração não foi emitido em dist/assets.");
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}

console.log(`✓ dist/index.html ok (${refs.length} referências, ${assets.length} assets)`);
