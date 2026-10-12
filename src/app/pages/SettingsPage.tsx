import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { GAMES, type GameId } from "../../engines/core/types";
import type { HintLevel } from "../../engines/core/types";
import { deleteSave, exportSave, importSave } from "../../persist/db";
import { parseSaveFile } from "../../persist/saveFile";
import { loadSettings, saveSettings, type AppSettings, type ThemeChoice } from "../../persist/settings";
import { applyTheme } from "../theme";

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [notice, setNotice] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [wipe, setWipe] = useState<Record<GameId, boolean>>(() =>
    Object.fromEntries(GAMES.map((g) => [g.id, g.id === "queens"])) as Record<GameId, boolean>,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  function persist(next: AppSettings) {
    setSettings(next);
    if (!saveSettings(next)) {
      setNotice("O navegador bloqueou o armazenamento: os ajustes valem só até fechar a aba.");
    }
  }

  function onTheme(theme: ThemeChoice) {
    applyTheme(theme);
    persist({ ...settings, theme });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice(
      saveSettings(settings)
        ? "Ajustes gravados neste navegador."
        : "O navegador bloqueou o armazenamento: os ajustes valem só até fechar a aba.",
    );
  }

  async function onExport() {
    const data = await exportSave();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-games-save.json";
    a.click();
    URL.revokeObjectURL(url);
    setImportErrors([]);
    setNotice("Arquivo de save baixado.");
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>, mode: "merge" | "replace") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportErrors([]);
    const result = parseSaveFile(await file.text());
    if (!result.ok) {
      setNotice(`Nada foi importado de ${file.name}. O arquivo não passou na validação:`);
      setImportErrors(result.errors);
      return;
    }
    try {
      await importSave(result.save, mode);
      const n = result.save.puzzles.length;
      setNotice(
        `${mode === "merge" ? "Save mesclado" : "Save substituído"}: ${n} fase${n === 1 ? "" : "s"} no arquivo.`,
      );
    } catch (err) {
      setNotice(
        `Importação falhou e nada foi alterado${err instanceof Error ? ` (${err.message})` : ""}.`,
      );
    }
  }

  async function onDeleteSelected() {
    const games = GAMES.map((g) => g.id).filter((id) => wipe[id]);
    if (games.length === 0) {
      setImportErrors([]);
      setNotice("Marque pelo menos um jogo.");
      return;
    }
    const names = games.map((id) => GAMES.find((g) => g.id === id)?.name).join(", ");
    if (!window.confirm(`Apagar o save de ${names}? Isso não dá para desfazer.`)) return;
    await deleteSave(games);
    setImportErrors([]);
    setNotice(`Save apagado: ${names}.`);
  }

  return (
    <section className="settings">
      <header className="mesa__head">
        <p className="eyebrow">Ajustes</p>
        <h2>Como cada jogo se comporta</h2>
      </header>

      <form className="stack" onSubmit={onSubmit}>
        <section className="game-settings">
          <h3>Aparência</h3>
          <fieldset className="pills">
            <legend>Tema</legend>
            {(
              [
                ["auto", "Do sistema"],
                ["light", "Claro"],
                ["dark", "Escuro"],
              ] as Array<[ThemeChoice, string]>
            ).map(([id, label]) => (
              <label key={id} className={settings.theme === id ? "pill is-on" : "pill"}>
                <input
                  type="radio"
                  name="theme"
                  value={id}
                  checked={settings.theme === id}
                  onChange={() => onTheme(id)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </section>

        <section className="game-settings">
          <h3>Queens</h3>
          <label className="check">
            <input
              type="checkbox"
              checked={settings.autoCheck}
              onChange={(e) => persist({ ...settings, autoCheck: e.target.checked })}
            />
            Marcar conflito na hora
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={settings.autoMarkQueens}
              onChange={(e) =>
                persist({ ...settings, autoMarkQueens: e.target.checked })
              }
            />
            Marcar X sozinho nas casas atacadas
          </label>
        </section>

        <section className="game-settings">
          <h3>Tango</h3>
          <p className="lede">
            Conflitos (trio, excesso, marcas =/× e linhas ou colunas repetidas) ficam vermelhos.
            As casas dadas não mudam com o clique.
          </p>
        </section>

        <section className="game-settings">
          <h3>Mini Sudoku</h3>
          <p className="lede">
            Dígitos 1 a 6. Caixas 2×3. Repetições ficam vermelhas. Casas dadas não mudam.
          </p>
        </section>

        <section className="game-settings">
          <h3>Zip</h3>
          <p className="lede">Arraste o caminho a partir do 1. Paredes bloqueiam a passagem.</p>
        </section>

        <section className="game-settings">
          <h3>Patches</h3>
          <p className="lede">
            Arraste o retângulo da pista. O número é a área; o símbolo trava a forma quando houver.
          </p>
        </section>

        <section className="game-settings">
          <h3>Todos os jogos</h3>
          <label className="seed">
            Teto de dica
            <select
              value={settings.hintCap}
              onChange={(e) =>
                persist({ ...settings, hintCap: Number(e.target.value) as HintLevel })
              }
            >
              <option value={1}>1 — só destaque</option>
              <option value={2}>2 — nome da técnica</option>
              <option value={3}>3 — explicação</option>
              <option value={4}>4 — aplicar o lance</option>
              <option value={5}>5 — walkthrough</option>
            </select>
          </label>
        </section>
        <button className="ghost" type="submit">
          Confirmar ajustes
        </button>
      </form>

      <div className="stack">
        <h3>Caderno neste aparelho</h3>
        <p className="lede">O save é um JSON. Mesclar não apaga ids que já existem.</p>
        <div className="play-tools">
          <button type="button" onClick={onExport}>
            Exportar save
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            Importar e mesclar
          </button>
        </div>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept="application/json"
          onChange={(e) => onImport(e, "merge")}
        />

        <h3>Apagar save</h3>
        <p className="lede">
          Remove fases, tentativas e resoluções do navegador. Ajustes (auto-X, teto de dica) ficam.
        </p>
        <div className="wipe-games">
          {GAMES.map((game) => (
            <label key={game.id} className="check">
              <input
                type="checkbox"
                checked={wipe[game.id]}
                onChange={(e) => setWipe((prev) => ({ ...prev, [game.id]: e.target.checked }))}
              />
              {game.name}
            </label>
          ))}
        </div>
        <div className="play-tools">
          <button type="button" className="danger" onClick={() => void onDeleteSelected()}>
            Apagar jogos marcados
          </button>
        </div>
      </div>

      {notice ? (
        <div className={importErrors.length > 0 ? "banner banner--err" : "banner"} role="status">
          <p>{notice}</p>
          {importErrors.length > 0 ? (
            <ul className="banner__list">
              {importErrors.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
