# Regras dos jogos (v1)

Implementação independente. As regras abaixo são as que o gerador, o solver e a UI precisam respeitar.

Todo puzzle entregue ao jogador tem **exatamente uma solução**.

---

## Queens

Grade `n×n` (típico 7×7 a 10×10) particionada em **n regiões** conexas, cada uma com uma cor.

Colocar exatamente **n coroas** tais que:

- Há uma coroa por linha
- Há uma coroa por coluna
- Há uma coroa por região
- Duas coroas **não se tocam**, inclusive na diagonal (vizinhança 8). Diagonais longas são permitidas: o que vale é não serem vizinhas.

A UI cicla célula vazia → marca (X) → coroa. Marcas são auxílio do jogador, não fazem parte da solução.

### Gerador e solver

- Gerar um conjunto válido de posições de coroas (com a restrição de não-adjacência) e depois crescer regiões ao redor de cada coroa
- Dificuldade: `n`, formato das regiões (compactas vs. espalhadas) e se o solver fecha só com “única célula possível na região/linha” ou precisa de cadeias de exclusão
- Solver por backtracking com verificação de unicidade; dicas devem preferir técnicas humanas (região de uma célula, linha/coluna saturada, exclusão por toque) antes de “chute”

### UI

Clique/toque nas células, desfazer, limpar, auto-marcar X após uma coroa (opcional), auto-check de conflito.

---

## Tango

Grade **fixa 6×6**. Cada célula é sol ou lua.

Regras:

- Cada linha e cada coluna tem **3 sóis e 3 luas**
- Não há três símbolos iguais consecutivos na horizontal nem na vertical (diagonal não conta)
- Entre algumas células adjacentes há marcas:
  - `=` — as duas células têm o **mesmo** símbolo
  - `×` — as duas células têm símbolos **opostos**
- Algumas células já vêm preenchidas

Há fontes que citam “nenhuma linha/coluna repetida” (estilo Binairo). Na v1 o motor **enforces** essa regra na geração (tabuleiro final com linhas distintas e colunas distintas), para os puzzles não degenerarem. Documentar na UI se a regra for usada na validação do jogador.

### Gerador e solver

- Dificuldade: quantidade de células dadas e de marcas `=`/`×`, mais a profundidade das técnicas (par forçado, equilíbrio 3/3, bloqueio de trio, propagação por `=`/`×`)
- Gerar um preenchimento completo válido e remover pistas até o limite da dificuldade, checando unicidade a cada remoção

### UI

Clique cicla vazio → sol → lua. Marcas `=`/`×` são estáticas no tabuleiro. Auto-check de trio, desequilíbrio e violação de marca.

---

## Mini Sudoku

Grade **6×6**, dígitos **1–6**.

- Cada linha contém 1–6 exatamente uma vez
- Cada coluna contém 1–6 exatamente uma vez
- Cada caixa **2×3** (seis caixas cobrindo a grade) contém 1–6 exatamente uma vez

Solução única por lógica, sem adivinhação.

### Gerador e solver

- Geração clássica: preencher uma solução, furar células, medir dificuldade pelas técnicas necessárias (único candidato, único na unidade, pares nulos, etc.)
- Dificuldade da v1: fácil / médio / difícil mapeada para o conjunto de técnicas, não só para o número de dadas
- Dicas ricas: este jogo é o melhor para os cinco níveis de hint

### UI

Teclado e clique para colocar dígito; notas/candidatos opcionais na v1 se não atrasarem o resto (podem ficar no polimento da Fase 8). Auto-check de repetição.

---

## Zip

Grade retangular (tamanhos típicos 6×6 até 8×8, eventualmente maior no difícil).

Algumas células têm números **1 … k** (não necessariamente todas as células). O jogador desenha **um único caminho** contínuo, ortogonal (sem diagonal), que:

- Começa no **1** e visita **2, 3, …, k** nessa ordem
- Passa por **todas** as células exatamente uma vez (caminho hamiltoniano na grade)
- Não atravessa **paredes**: segmentos bloqueados entre células vizinhas (traço vertical ou horizontal entre duas casas)

### Gerador e solver

- Gerar um caminho hamiltoniano, escolher um subconjunto de células do caminho para virar números (sempre incluindo início e fim), e opcionalmente inserir paredes que não cortem esse caminho mas cortem atalhos
- Unicidade: só aquele caminho (ou, na prática, só um caminho que obedece números + paredes + cobertura total)
- Dificuldade: tamanho da grade, densidade de paredes, esparsidade dos números
- Dicas: trechos forçados (corredor, único jeito de ligar i → i+1 sem isolar células)

### UI

Arrastar a partir do 1 (pointer hold). Recuar o caminho arrastando para trás. Paredes visíveis como bordas grossas. Este jogo entra tarde no roadmap porque a UI de arraste é mais cara que clique.

---

## Patches

Grade retangular (típico 5×5 a 10×10). O jogador parte a grade em **retângulos** (incluindo quadrados) que:

- Não se sobrepõem e cobrem **todas** as células
- Cada retângulo contém **exatamente uma pista**
- A pista define:
  - **Área** (número de células), quando houver número
  - **Forma**: quadrado, mais alto que largo, mais largo que alto, ou livre (qualquer retângulo válido)

Uma pista sem número (“freeform”) aceita qualquer área, desde que a forma e a unicidade da partição fechem. Na v1, preferir pistas **sempre numeradas** para o gerador ficar simples e testável; freeform só se unicidade continuar fácil de provar.

### Gerador e solver

- Partir de uma partição retangular da grade, colocar uma pista em cada retângulo (área + restrição de forma compatível), depois eventualmente apertar a restrição de forma
- Unicidade: enumerar partições Shikaku e garantir uma só
- Dificuldade: tamanho, primos (faixas 1×n), quantas formas estão “livres” vs. travadas (quadrado/alto/largo)
- Dicas: pista com uma só geometria possível, canto, primos na borda

### UI

Arrastar para desenhar o retângulo da pista; clicar de novo para desfazer aquele patch. Entra por último com Zip: UI espacial.

---

## Comparativo rápido

| Jogo | Grade | Interação | Núcleo do solver |
| --- | --- | --- | --- |
| Queens | n×n variável | Clique (vazio / X / coroa) | Colocação + regiões + não-adjacência |
| Tango | 6×6 fixa | Clique (sol / lua) | Binário + marcas |
| Mini Sudoku | 6×6 fixa | Clique / teclado (1–6) | Sudoku clássico reduzido |
| Zip | variável | Arraste de caminho | Hamiltoniano + paredes |
| Patches | variável | Desenho de retângulo | Shikaku + forma |

Jogos de palavra (Pinpoint, Crossclimb, Wend) não têm regras neste documento. Ver [ROADMAP.md](ROADMAP.md).
