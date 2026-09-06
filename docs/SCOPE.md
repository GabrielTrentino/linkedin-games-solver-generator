# Escopo da v1

Gerador e jogador local dos cinco jogos de lógica no estilo LinkedIn: Queens, Tango, Zip, Mini Sudoku e Patches.

O app roda no navegador (`npm run dev` → `localhost`). Não há servidor, conta nem nuvem. Cada puzzle gerado tem solução única e pode ser reaberto pelo mesmo seed.

## Objetivos

- Treinar os jogos de lógica sem o limite de “um por dia”
- Controlar dificuldade (mais fácil ou mais difícil que o ritmo típico)
- Rejogar a mesma fase para comparar tempo e uso de dicas
- Pedir ajuda em níveis, do destaque sutil ao walkthrough completo
- Guardar histórico para ver evolução
- Guardar a resolução (sequência de lances / passos do solver)

## Requisitos funcionais

### Geração

- O jogador escolhe jogo, dificuldade e (opcionalmente) um seed
- Sem seed, o app sorteia um e o exibe, para poder repetir depois
- O gerador só entrega tabuleiro com **solução única**
- Dificuldade combina tamanho da grade (quando o jogo permite), quantidade de pistas e profundidade das técnicas que o solver precisa usar — não é só “grade maior”
- A identidade da fase é `{ game, seed, difficulty, generatorVersion }`

### Jogo

- Jogar no tabuleiro com as interações do tipo (clique, arraste de caminho, desenho de retângulo)
- Desfazer, refazer e limpar
- Validação de regras (opcional “auto-check”, no estilo Queens)
- Cronômetro da tentativa
- Detectar conclusão e registrar a tentativa

### Dicas

Cinco níveis, do menos ao mais revelador:

1. Destacar região ou célula relevante
2. Nomear a técnica
3. Explicar a dedução
4. Aplicar o próximo lance
5. Walkthrough completo (salvável como resolução)

O jogador escolhe o teto de dica da sessão (ex.: só até o nível 2). Cada dica usada entra no registro da tentativa.

### Persistência

- Salvar a definição da fase (identidade + tabuleiro serializado)
- Salvar cada tentativa: início, fim, tempo, dicas usadas, se concluiu
- Salvar resolução opcional (passos)
- Listar histórico por jogo, filtrar por dificuldade e por concluído/não concluído
- Reabrir qualquer fase salva e **regenerar o mesmo tabuleiro**, não um “parecido”
- Exportar e importar um arquivo JSON com catálogo + histórico (backup)

### Acompanhamento

- Por jogo: quantas fases geradas, quantas concluídas, tempo médio, dicas médias
- Por fase: tentativas, melhor tempo, se já foi resolvida sem dicas
- Não é ranking social: só estatística local

## Requisitos não funcionais

- 100% local: sem rede obrigatória depois de `npm install`
- Geração pesada em Web Worker, para a UI não congelar
- Motores de puzzle sem dependência de React, cobertos por teste
- Seed reproduzível na mesma `generatorVersion`
- Documentação e UI em português
- Acessibilidade básica na v1: teclado nos jogos de clique, contraste, não depender só de cor (Queens usa região + padrão)

## Não-objetivos da v1

- Pinpoint, Crossclimb e Wend
- Importar ou scrapar o puzzle diário oficial do LinkedIn
- Conta, sincronização, multiplayer, leaderboard
- App nativo (iOS/Android/Electron)
- Temas visuais fiéis à marca LinkedIn
- IA generativa para dicas ou para montar tabuleiros
- Editor manual de puzzles (pode entrar depois; a v1 é gerar + jogar)

## Critérios de pronto da v1

A v1 está pronta quando:

1. Os cinco jogos geram, jogam e validam com solução única
2. Seed + versão do gerador reproduzem o tabuleiro
3. Os cinco níveis de dica existem pelo menos em Queens, Tango e Mini Sudoku; Zip e Patches têm no mínimo níveis 1, 4 e 5 (destaque, aplicar lance, walkthrough)
4. Histórico, rejogar, salvar resolução e export/import JSON funcionam
5. Há estatísticas locais por jogo
6. O README explica instalar, rodar e exportar o save
7. Testes de motor cobrem regras, unicidade e replay de seed para cada jogo

Detalhe por fase: [ROADMAP.md](ROADMAP.md). Regras: [GAMES.md](GAMES.md). Forma do código: [ARCHITECTURE.md](ARCHITECTURE.md).
