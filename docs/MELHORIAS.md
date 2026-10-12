# Melhorias sugeridas

Levantamento original de publicação, consistência, qualidade e visual. Os itens viraram as **trilhas paralelas A e B** do [ROADMAP.md](ROADMAP.md), que é a fonte do status atual (o que foi feito e o que ficou aberto). Esta página mantém o porquê de cada item e as medições.

## Contraste medido (WCAG 2.x)

Razões calculadas com a fórmula de luminância relativa. AA exige 4,5:1 para texto normal e 3:1 para elementos gráficos.

| Par | Antes | Depois |
| --- | --- | --- |
| Texto secundário sobre a barra lateral | 4,17 (`#5c6b80` / `#c1cfdc`) | 4,60 (`#4f5e73` / `#cdd9e4`) |
| Links em cobre sobre a folha | 3,97 (`#c45c26`) | 5,32 (`#a84a1c`) |
| Texto do botão principal | 4,01 (`#fff6ee` / `#c45c26`) | 4,94 (`#fff6ee` / `#b04f1f`) |
| Item ativo da navegação | 3,9 (cobre sobre a barra) | 10,3 (texto marinho, sublinhado em cobre) |
| Tema escuro: texto / folha | — | 14,1 (`#e6edf5` / `#151e31`) |
| Tema escuro: texto secundário / folha | — | 7,7 (`#a3b2c6` / `#151e31`) |
| Tema escuro: cobre / folha | — | 7,1 (`#f0915c` / `#151e31`) |

O anel de foco das casas é duplo (branco por fora, marinho por dentro): nenhuma cor única passava de 3:1 ao mesmo tempo contra as regiões pastel do Queens e contra as casas escuras.

---

## 1. Publicação no GitHub Pages

Bloqueadores (devem ser resolvidos antes de publicar):

- **Base path do Vite.** `vite.config.ts` não define `base`. Em `usuario.github.io/linkedin-games-solver-generator/`, scripts e CSS apontam para `/` e falham. Sugestão: `base: "/linkedin-games-solver-generator/"`, ou `"./"` para não depender do nome do repositório.
- **Roteamento SPA.** `src/main.tsx` usa `BrowserRouter` sem `basename`. O GitHub Pages não reescreve rotas, então recarregar `/mesa` ou abrir um link direto dá 404. Opções:
  - `HashRouter` (mais simples, URLs com `#`);
  - `BrowserRouter` com `basename` e um `404.html` que redireciona para `index.html`.
- **Workflow de deploy.** Não existe `.github/workflows/`. Falta um workflow que rode `npm ci`, `npm run build` e publique `dist/` com `actions/deploy-pages`, com Node LTS e cache de npm.
- **Ativar o Pages** em Settings → Pages → Source: *GitHub Actions*.
- **Validar o build de produção** com `npm run build && npm run preview`, e abrir cada rota direto pela URL final.

Recomendados:

- Adicionar `"homepage"` e `"repository"` no `package.json`.
- Verificar que o Web Worker de geração funciona no build de produção (o caminho do worker muda com `base`).
- Incluir `<meta name="description">` e Open Graph no `index.html` (título e descrição já existem só como `<title>`).

## 2. Consistência da documentação

- **README desatualizado.** Diz "Fase 0 — Documentação, sem código de app ainda", mas já há motores, UI e testes. Atualizar a fase atual e a lista de jogos jogáveis.
- **Roadmap desatualizado.** Fases 2 a 7 aparecem como "em curso", mas os commits mostram Queens, Tango, Zip, Mini Sudoku e Patches jogáveis. Marcar o status real de cada fase.
- **Comandos.** O README pede `npm test`, que roda `vitest` em modo watch. Para CI e primeira execução, documentar `npx vitest run`.
- **Licença.** O repositório não tem `LICENSE`. Sem licença, o código não pode ser reutilizado por terceiros.
- **Idioma.** A documentação está em português e o código mistura nomes em português e inglês (ex.: `PuzzleAttemptsPage`, `HistoryLayout`). Definir uma convenção e registrá-la em `ARCHITECTURE.md`.

## 3. Qualidade e build

- **Rodar `npm test` e `tsc -b` limpos** e registrar o resultado no README.
- **`vite.config.ts` dentro do `tsc -b`.** A config importa `vitest/config`, então o `build` depende de tipos de teste. Separar a config de teste (`vitest.config.ts`) ou ajustar `tsconfig.node.json`.
- **Workflow de CI** que rode testes e build em cada PR, além do deploy.
- **Teste de smoke** do build: abrir `dist/index.html` e verificar que a rota inicial renderiza.
- **Validação de import/export JSON.** Importar um arquivo malformado hoje pode corromper o IndexedDB. Validar schema e versão antes de gravar, e mostrar erro legível.
- **Tratamento de IndexedDB indisponível.** Modo privado em alguns navegadores e bloqueio de armazenamento devem mostrar uma mensagem clara, não tela em branco.
- **Cancelar geração lenta.** Há Web Worker, mas não há botão para cancelar uma geração demorada.

## 4. Visual e experiência (sugestões)

Estado atual observado: paleta de papel azul-acinzentado com cobre como destaque (`--copper`), fontes Syne (títulos), Atkinson Hyperlegible (texto) e IBM Plex Mono (rótulos e códigos), layout de duas colunas (barra lateral "Oficina" + folha principal), fundo com grade sutil. A identidade é consistente e distinta dos jogos originais, o que é bom. As sugestões abaixo reforçam isso.

### Tema e contraste
- **Modo escuro.** O CSS só define um tema claro. Adicionar tokens de cor para `prefers-color-scheme: dark` (e um seletor manual em Ajustes), reaproveitando as mesmas variáveis `--paper`, `--ink`, `--copper`.
- **Verificar contraste WCAG AA.** `--mute` (#5c6b80) sobre `--sheet` (#f3f7fa) e textos em cobre sobre papel precisam ser medidos. Textos secundários devem chegar a 4.5:1.
- **Estados que não dependem só de cor.** Conflitos em Queens e Tango devem ter também ícone ou padrão (hachura, contorno), para daltonismo.

### Layout e responsividade
- **Breakpoint único em 800px.** Testar entre 360px e 1280px. Considerar barra de navegação inferior ou colapsável no mobile, em vez de empilhar a barra lateral.
- **Tabuleiros em telas pequenas.** Garantir que grades de 6×6 e as células de toque tenham pelo menos 44px, e que a grade caiba sem rolagem horizontal.
- **Largura máxima do conteúdo** na folha principal, para textos de histórico e ajustes não ficarem longos demais em telas largas.

### Hierarquia e clareza
- **Estado atual do jogo sempre visível.** Mostrar tempo, dicas usadas e progresso (ex.: 12/36 células) em uma faixa fixa, para o jogador não precisar procurar.
- **Feedback de erro não invasivo.** Conflitos atrasados (já existem no Tango) devem ser destacados sem interromper o fluxo; mensagem de vitória com resumo (tempo, dicas, dificuldade).
- **Página inicial com cartões por jogo** mostrando o último resultado, melhor tempo e um pequeno preview do tabuleiro (os componentes `*Preview.tsx` já existem e podem ser reaproveitados).
- **Estados vazios.** Histórico vazio e estatísticas sem dados devem explicar o próximo passo ("Gere sua primeira fase").

### Movimento e polimento
- **Transições discretas** ao preencher células e ao concluir um tabuleiro. O CSS já respeita `prefers-reduced-motion`; manter esse padrão em qualquer animação nova.
- **Foco visível consistente.** Já existem `:focus-visible` em botões e links; estender a todos os controles dos tabuleiros (células, arraste do Zip, desenho do Patches).
- **Ícones e rótulos.** Padronizar ícones de ação (desfazer, limpar, dica) em um conjunto único, com rótulo acessível.

### Identidade
- **Favicon e ícone de app** (`manifest.webmanifest`) combinando com a paleta. Como é um app para Pages, um manifesto simples já permite "instalar" no celular.
- **Tela de carregamento da geração** com texto da etapa atual, não só um spinner, já que a geração pode demorar.

## 5. Ordem sugerida

1. Publicação (seção 1): sem ela, nada do resto aparece para quem visita.
2. Consistência da documentação (seção 2): README e roadmap precisam refletir o estado real.
3. Qualidade e CI (seção 3): garante que o deploy automático não publica build quebrado.
4. Visual (seção 4): começar por contraste e responsividade, que afetam mais usuários, e deixar identidade e polimento para depois.

---

*Próximo passo:* validar localmente o item 1 e 3 (com dependências instaladas) e converter os itens confirmados em issues ou tarefas no roadmap.
