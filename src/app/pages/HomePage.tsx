import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DIFFICULTIES, GAMES, type Difficulty, type GameId } from "../../engines/core/types";
import { randomSeed } from "../../engines/core/seed";
import { savePuzzle } from "../../persist/db";
import { generatePuzzle } from "../../play/generateClient";
import { GameGlyph } from "../../ui/GameGlyph";

export function HomePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<GameId>("queens");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [seed, setSeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const usedSeed = seed.trim() || randomSeed();
    try {
      const puzzle = await generatePuzzle({
        game,
        seed: usedSeed,
        difficulty,
        generatorVersion: "noop-0",
      });
      const id = crypto.randomUUID();
      await savePuzzle({
        id,
        game: puzzle.game,
        seed: puzzle.seed,
        difficulty: puzzle.difficulty,
        generatorVersion: puzzle.generatorVersion,
        payload: puzzle.payload,
        createdAt: Date.now(),
      });
      navigate(`/play/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não deu para gerar a fase.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mesa" onSubmit={onSubmit}>
      <header className="mesa__head">
        <p className="eyebrow">Mesa de trabalho</p>
        <h2>Escolha o jogo e abra uma fase</h2>
        <p className="lede">
          Os motores ainda são um stub. A fase entra no caderno local e você já
          pode reabrir pelo seed.
        </p>
      </header>

      <fieldset className="tiles">
        <legend className="sr-only">Jogo</legend>
        {GAMES.map((item) => (
          <label
            key={item.id}
            className={game === item.id ? "tile is-selected" : "tile"}
          >
            <input
              type="radio"
              name="game"
              value={item.id}
              checked={game === item.id}
              onChange={() => setGame(item.id)}
            />
            <GameGlyph game={item.id} />
            <span className="tile__name">{item.name}</span>
            <span className="tile__blurb">{item.blurb}</span>
          </label>
        ))}
      </fieldset>

      <div className="mesa__row">
        <fieldset className="pills">
          <legend>Dificuldade</legend>
          {DIFFICULTIES.map((item) => (
            <label key={item.id} className={difficulty === item.id ? "pill is-on" : "pill"}>
              <input
                type="radio"
                name="difficulty"
                value={item.id}
                checked={difficulty === item.id}
                onChange={() => setDifficulty(item.id)}
              />
              {item.name}
            </label>
          ))}
        </fieldset>

        <label className="seed">
          Seed
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="em branco = sorteia"
            spellCheck={false}
            autoComplete="off"
          />
        </label>
      </div>

      {error ? <p className="banner banner--err">{error}</p> : null}

      <button className="play" type="submit" disabled={busy}>
        {busy ? "Gerando…" : "Abrir fase"}
      </button>
    </form>
  );
}
