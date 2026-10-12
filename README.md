# Oficina de lógica — gerador e jogador local

App web **100% no navegador** para gerar, jogar, salvar e rejogar puzzles no estilo dos jogos de lógica do LinkedIn.

Não copia tabuleiros oficiais nem usa marca ou assets da plataforma. É uma implementação independente das mesmas famílias de regras, pensada para treino ilimitado, replay da mesma fase e acompanhamento de evolução.

**Jogar:** <https://gabrieltrentino.github.io/linkedin-games-solver-generator/> (publicado pelo GitHub Pages a cada push na `main`).

## Jogos

| Jogo | Regra | Estado |
| --- | --- | --- |
| Queens | Uma coroa por linha, coluna e região; coroas não se tocam | Jogável |
| Tango | Grade 6×6 de sóis e luas, com marcas `=` e `×` | Jogável |
| Mini Sudoku | Sudoku 6×6 (dígitos 1–6, caixas 2×3) | Jogável |
| Zip | Um caminho que liga os números em ordem e preenche todas as células | Jogável |
| Patches | Particionar a grade em retângulos a partir de pistas de área e forma | Jogável |

As dicas ainda não estão implementadas (o botão aparece desabilitado). Ver [roadmap](docs/ROADMAP.md).

**Fora da v1:** Pinpoint, Crossclimb e Wend (palavra/trivia).

## O que já faz

- Gera fases com dificuldade fácil, média ou difícil, numa thread separada (Web Worker), com opção de cancelar
- Reproduz a **mesma** fase a partir da seed
- Cronômetro, desfazer, limpar e detecção de conclusão
- Caderno por jogo: lista de fases, execuções por seed e gráfico de tempos
- Exporta e importa o progresso em JSON (com validação antes de gravar)
- Tema claro, escuro ou do sistema
- Navegação por teclado (setas) em Queens, Tango e Mini Sudoku

## Onde ficam os dados

Tudo fica no **IndexedDB do navegador de quem joga**. Não há conta, servidor nem sincronização entre aparelhos. Para levar o progresso para outro navegador, use **Ajustes → Exportar save** e importe o arquivo no outro lado.

Em janela anônima (ou com armazenamento bloqueado), o app avisa que nada será salvo.

## Rodar localmente

Requer Node 20 ou superior.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda os testes uma vez (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run typecheck` | Checagem de tipos (`tsc -b`) |
| `npm run build` | Checagem de tipos + build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente |
| `npm run check:dist` | Smoke do build: caminhos relativos e worker emitido |

## Publicação (GitHub Pages)

- `vite.config.ts` usa `base: "./"`, então o build funciona em qualquer subpasta.
- As rotas usam `HashRouter` (`/#/mesa`), então recarregar ou abrir um link direto nunca dá 404.
- `.github/workflows/deploy.yml` roda testes, build e smoke, e publica `dist/` a cada push na `main`.
- `.github/workflows/ci.yml` roda as mesmas checagens em pull requests e em outros branches.

**Primeira vez:** em *Settings → Pages*, escolha *Source: GitHub Actions*. Depois disso, cada push na `main` publica sozinho.

## Stack

- **TypeScript**, **Vite + React**, **React Router** (hash)
- **Motores puros** (sem React) em `src/engines/<jogo>/`, testáveis à parte
- **Web Worker** para geração
- **IndexedDB (Dexie)** para fases, tentativas e soluções
- **Vitest** para unicidade da solução, seeds, regras e validação do save

## Documentação

- [Escopo da v1](docs/SCOPE.md)
- [Regras dos jogos](docs/GAMES.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Melhorias (levantamento e status)](docs/MELHORIAS.md)

## Fora de escopo

- Scraping ou replay dos puzzles diários oficiais do LinkedIn
- Conta, nuvem ou ranking social
- App mobile nativo
- Monetização
- Jogos de palavra na v1

## Licença

[MIT](LICENSE).
