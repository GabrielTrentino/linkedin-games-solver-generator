# Arquitetura prevista

Ainda não há código. Este documento trava as decisões para a Fase 1 em diante.

## Princípios

- **Local-first:** Vite serve o app; o browser guarda o estado
- **Motores puros:** geração, validação, unicidade e dicas não importam React
- **Um contrato por jogo:** a UI de sessão fala com `PuzzleEngine`, não com detalhes de Queens vs. Zip
- **Seed + versão:** replay é reprodução, não “outro tabuleiro parecido”
- **Geração fora da thread da UI:** Web Worker

```mermaid
flowchart LR
  UI[UI React] --> Catalog[Catalogo e progresso]
  UI --> Play[Sessao de jogo]
  Play --> Engine[PuzzleEngine]
  Engine --> Gen[Gerador com seed]
  Engine --> Solver[Solver unicidade]
  Engine --> Hints[Dicas por tecnica]
  Catalog --> DB[(IndexedDB)]
  Play --> DB
```

## Pastas previstas

```
src/
  app/                 # shell: rotas, layout, histórico, settings
  play/                # sessão: cronômetro, dicas, desfazer, conclusão
  engines/
    core/              # PuzzleEngine, Difficulty, HintLevel, RNG de seed
    queens/
    tango/
    zip/
    mini-sudoku/
    patches/
  persist/             # Dexie, export/import JSON
  workers/             # generatePuzzle(game, seed, difficulty)
  ui/
    boards/            # grades específicas (clique, path, retângulo)
```

Testes em `src/engines/**/*.test.ts` (Vitest).

## Contrato `PuzzleEngine`

Cada jogo exporta um objeto que implementa o mesmo tipo (nomes aproximados):

```ts
generate(seed: string, difficulty: Difficulty, generatorVersion: string): Puzzle
validate(puzzle: Puzzle, state: State): RuleViolation[]
isSolved(puzzle: Puzzle, state: State): boolean
applyMove(state: State, move: Move): State
hint(puzzle: Puzzle, state: State, level: HintLevel): Hint
serialize(puzzle: Puzzle): string
deserialize(payload: string): Puzzle
```

- `generate` é **determinístico** para o mesmo `(seed, difficulty, generatorVersion)`
- Se o algoritmo de geração mudar de forma incompatível, sobe `generatorVersion` e fases antigas continuam a reproduzir com a versão gravada
- `hint` pode devolver `null` se não houver dedução naquele nível (aí a UI sobe o nível ou avisa)

Dificuldade da v1: `easy | medium | hard`. Cada motor mapeia isso para tamanho, densidade de pistas e teto de técnicas.

## Dicas

| Nível | O que a UI mostra | O que o motor devolve |
| --- | --- | --- |
| 1 | Destaque | Células/regiões alvo |
| 2 | Nome da técnica | `techniqueId` + rótulo em PT |
| 3 | Texto | Explicação da dedução |
| 4 | Aplica lance | `Move` aplicável |
| 5 | Walkthrough | Lista ordenada de `Hint` nível 3+4 |

Nível 5 pode ser salvo como `Solution` da fase.

Zip e Patches, na v1, podem implementar só 1, 4 e 5; Queens, Tango e Mini Sudoku implementam 1–5. Ver critérios em [SCOPE.md](SCOPE.md).

## Modelo de dados (IndexedDB via Dexie)

**puzzles**

- `id` (uuid)
- `game` (`queens` \| `tango` \| `zip` \| `mini-sudoku` \| `patches`)
- `seed`
- `difficulty`
- `generatorVersion`
- `payload` (JSON do tabuleiro)
- `createdAt`

**attempts**

- `id`
- `puzzleId`
- `startedAt` / `finishedAt`
- `elapsedMs`
- `hintsUsed` (contagem por nível)
- `completed` (boolean)
- `finalState` (opcional, snapshot)

**solutions**

- `id`
- `puzzleId`
- `createdAt`
- `source` (`player` \| `walkthrough`)
- `steps` (lista de lances / hints)

Índices: `game`, `puzzleId`, `completed`. Export JSON = dump dessas três tabelas + `meta.schemaVersion`.

## Persistência e backup

- Fonte da verdade: IndexedDB
- Botão **Exportar** baixa `linkedin-games-save.json`
- Botão **Importar** faz merge por `id` (não apaga o que já existe, a menos que o usuário peça substituir)
- Replay: carregar `payload` salvo **ou** chamar `generate` com o mesmo seed/versão; os testes exigem que os dois coincidam

## UI (shell)

Rotas previstas:

- `/` — escolher jogo, dificuldade, “nova fase” ou seed
- `/play/:puzzleId` — sessão
- `/history` — fases e tentativas
- `/stats` — agregados por jogo
- `/settings` — auto-check, auto-X (Queens), teto de dica padrão, import/export

Sem autenticação.

## Geração no Worker

A UI manda `{ game, seed, difficulty, generatorVersion }` e espera `{ puzzle }` ou `{ error }`. Timeout e botão cancelar entram no polimento (Fase 8) se a geração difícil passar de ~2s com frequência.

## Testes mínimos por motor

- Regras: estado inválido é detectado; estado solução passa em `isSolved`
- Unicidade: `generate` produz puzzle com uma só solução
- Seed: dois `generate` iguais batem byte a byte no `serialize`
- Hint nível 4, num estado intermediário conhecido, aplica um lance legal que reduz o espaço
