import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { GAMES, type GameId } from "../../engines/core/types";
import type { HintLevel } from "../../engines/core/types";
import { deleteSave, exportSave, importSave, type SaveFile } from "../../persist/db";
import { loadSettings, saveSettings, type AppSettings } from "../../persist/settings";

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [notice, setNotice] = useState<string | null>(null);
  const [wipe, setWipe] = useState<Record<GameId, boolean>>(() =>
    Object.fromEntries(GAMES.map((g) => [g.id, g.id === "queens"])) as Record<GameId, boolean>,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  function persist(next: AppSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    saveSettings(settings);
    setNotice("Ajustes gravados neste navegador.");
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
    setNotice("Arquivo de save baixado.");
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>, mode: "merge" | "replace") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as SaveFile;
      if (!parsed.meta || !Array.isArray(parsed.puzzles)) {
        throw new Error("JSON sem o formato do save.");
      }
      await importSave(parsed, mode);
      setNotice(mode === "merge" ? "Save mesclado." : "Save substituído.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Importação falhou.");
    }
  }

  async function onDeleteSelected() {
    const games = GAMES.map((g) => g.id).filter((id) => wipe[id]);
    if (games.length === 0) {
      setNotice("Marque pelo menos um jogo.");
      return;
    }
    const names = games.map((id) => GAMES.find((g) => g.id === id)?.name).join(", ");
    if (!window.confirm(`Apagar o save de ${names}? Isso não dá para desfazer.`)) return;
    await deleteSave(games);
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

        {GAMES.filter((game) => game.id !== "queens").map((game) => (
          <section key={game.id} className="game-settings is-muted">
            <h3>{game.name}</h3>
            <p className="lede">Ainda não há ajustes — o tabuleiro entra numa fase seguinte.</p>
          </section>
        ))}

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

      {notice ? <p className="banner">{notice}</p> : null}
    </section>
  );
}
