import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES, isGameId, type Difficulty, type GameId } from "../../engines/core/types";
import { randomSeed } from "../../engines/core/seed";
import { engineFor } from "../../engines/registry";
import { savePuzzle } from "../../persist/db";
import { generatePuzzle } from "../../play/generateClient";
import { GameGlyph } from "../../ui/GameGlyph";

export function HomePage() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const locked = isGameId(gameId) ? gameId : null;
  const [game, setGame] = useState<GameId>(locked ?? "queens");
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
        generatorVersion: engineFor(game).generatorVersion,
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
        {locked ? (
          <>
            <p className="eyebrow">Nova fase</p>
            <h2>Gerar tabuleiro</h2>
          </>
        ) : (
          <>
            <p className="eyebrow">Mesa de trabalho</p>
            <h2>Escolha o jogo e abra uma fase</h2>
          </>
        )}
        <p className="lede">
          {locked
            ? "Seed em branco sorteia. A fase entra no caderno deste jogo."
            : "Ou abra um jogo pelas Marcas para ver o caderno, tempos e prévias."}
        </p>
      </header>

      <fieldset className="tiles">
        <legend className="sr-only">Jogo</legend>
        {GAMES.filter((item) => !locked || item.id === locked).map((item) => (
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
            <span className="tile__name">
              {item.name}
              {item.ready ? "" : " · em breve"}
            </span>
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
