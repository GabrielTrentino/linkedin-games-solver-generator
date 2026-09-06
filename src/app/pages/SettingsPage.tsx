import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { exportSave, importSave, type SaveFile } from "../../persist/db";
import { loadSettings, saveSettings, type AppSettings } from "../../persist/settings";
import type { HintLevel } from "../../engines/core/types";

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [notice, setNotice] = useState<string | null>(null);
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

  return (
    <section className="settings">
      <header className="mesa__head">
        <p className="eyebrow">Ajustes</p>
        <h2>Como o tabuleiro se comporta</h2>
      </header>

      <form className="stack" onSubmit={onSubmit}>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.autoCheck}
            onChange={(e) => persist({ ...settings, autoCheck: e.target.checked })}
          />
          Marcar conflito na hora (auto-check)
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.autoMarkQueens}
            onChange={(e) =>
              persist({ ...settings, autoMarkQueens: e.target.checked })
            }
          />
          Em Queens, marcar X sozinho nas casas atacadas
        </label>
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
      </div>

      {notice ? <p className="banner">{notice}</p> : null}
    </section>
  );
}
