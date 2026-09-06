# LinkedIn Games — gerador e jogador local

App web **100% local** para gerar, jogar, pedir dicas, salvar e rejogar puzzles no estilo dos jogos de lógica do LinkedIn.

Não copia tabuleiros oficiais nem usa marca ou assets da plataforma. É uma implementação independente das mesmas famílias de regras, pensada para treino ilimitado, replay da mesma fase e acompanhamento de evolução.

Documentação desta fase (escopo, sem código de app ainda):

- [Escopo da v1](docs/SCOPE.md)
- [Regras dos jogos](docs/GAMES.md)
- [Arquitetura prevista](docs/ARCHITECTURE.md)
- [Roadmap em fases](docs/ROADMAP.md)

## O que o produto faz

- Gerar fases novas com dificuldade configurável
- Rejogar a **mesma** fase (seed determinístico)
- Pedir dicas em vários níveis de verbosidade
- Salvar a resolução (passos) e o histórico de fases
- Acompanhar evolução (tempos, dicas usadas, conclusão)
- Reabrir qualquer fase salva

## Jogos da v1

Só lógica nesta versão:

| Jogo | Tipo |
| --- | --- |
| Queens | Uma coroa por linha, coluna e região; coroas não se tocam |
| Tango | Grade 6×6 de sóis e luas, com marcas `=` e `×` |
| Zip | Um caminho que liga os números em ordem e preenche todas as células |
| Mini Sudoku | Sudoku 6×6 (dígitos 1–6, caixas 2×3) |
| Patches | Particionar a grade em retângulos a partir de pistas de área e forma |

**Fora da v1:** Pinpoint, Crossclimb e Wend (palavra/trivia). Ver [roadmap](docs/ROADMAP.md).

## Stack

Tudo no navegador; sem backend.

- **TypeScript** — UI e motores de puzzle na mesma linguagem
- **Vite + React** — app local e grades interativas
- **Motores puros** (sem React) em `src/engines/<jogo>/`, testáveis à parte
- **Web Worker** — geração sem travar a interface
- **IndexedDB (Dexie)** — fases, tentativas e soluções no próprio browser
- **Export/import JSON** — backup do progresso
- **Vitest** — unicidade da solução, seeds e regras

TypeScript cobre gerador e UI. Python deixaria os solvers fáceis, mas exigiria um front separado. Next.js não agrega: não há SSR.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Dados ficam no IndexedDB do navegador; backup em Ajustes (export JSON).

```bash
npm test
```

A Fase 1 entrega o shell (mesa, caderno, marcas, ajustes) e um gerador stub. O tabuleiro jogável começa na Fase 2 (Queens).

## Fora de escopo

- Scraping ou replay dos puzzles diários oficiais do LinkedIn
- Conta, nuvem ou ranking social
- App mobile nativo
- Monetização
- Jogos de palavra na v1

## Fase atual

**Fase 0 — Documentação.** Próximo passo: [Fase 1 — Fundação](docs/ROADMAP.md).
