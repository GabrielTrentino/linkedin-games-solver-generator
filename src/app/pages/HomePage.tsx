import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIFFICULTIES, GAMES, isGameId, type Difficulty, type GameId } from "../../engines/core/types";
import { randomSeed } from "../../engines/core/seed";
import { engineFor } from "../../engines/registry";
import { savePuzzle } from "../../persist/db";
import { GenerationCancelled, generatePuzzle, type GenerationJob } from "../../play/generateClient";
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
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const job = useRef<GenerationJob | null>(null);

  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [busy]);

  // Sair da página no meio da geração encerra o worker.
  useEffect(() => () => job.current?.cancel(), []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setStartedAt(Date.now());
    setNow(Date.now());
    const usedSeed = seed.trim() || randomSeed();
    try {
      job.current = generatePuzzle({
        game,
        seed: usedSeed,
        difficulty,
        generatorVersion: engineFor(game).generatorVersion,
      });
      const puzzle = await job.current.promise;
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
      if (err instanceof GenerationCancelled) {
        setError(null);
      } else {
        setError(
          err instanceof Error
            ? `Não deu para gerar a fase: ${err.message}`
            : "Não deu para gerar a fase. Tente outra seed ou outra dificuldade.",
        );
      }
    } finally {
      job.current = null;
      setBusy(false);
      setStartedAt(null);
    }
  }

  const waited = startedAt == null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
  const gameName = GAMES.find((g) => g.id === game)?.name ?? game;
  const diffName = DIFFICULTIES.find((d) => d.id === difficulty)?.name.toLowerCase() ?? difficulty;

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

      {busy ? (
        <div className="generating" role="status" aria-live="polite">
          <span className="generating__bar" aria-hidden="true" />
          <p>
            Gerando {gameName} {diffName} e conferindo se a solução é única… <code>{waited}s</code>
          </p>
          {waited >= 4 ? (
            <p className="muted">Fases difíceis podem levar mais tempo. Dá para cancelar e tentar outra seed.</p>
          ) : null}
          <button className="ghost" type="button" onClick={() => job.current?.cancel()}>
            Cancelar
          </button>
        </div>
      ) : (
        <button className="play" type="submit">
          Abrir fase
        </button>
      )}
    </form>
  );
}
