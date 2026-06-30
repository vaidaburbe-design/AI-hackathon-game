import { NoiseMeter } from "./NoiseMeter";
import { getRoundDefinition } from "../data/rounds";
import type { GameState } from "../types/game";

interface GameHUDProps {
  state: GameState;
  onEndGame: () => void;
  onToggleList: () => void;
  listOpen: boolean;
}

export function GameHUD({ state, onEndGame, onToggleList, listOpen }: GameHUDProps) {
  const roundDef = getRoundDefinition(state.round);

  return (
    <header className="game-hud">
      <div className="hud-top">
        <div>
          <h1 className="game-title doodle-title">Keep It Quiet</h1>
          <p className="round-info">{roundDef.title}</p>
        </div>
        <div className="hud-actions">
          {state.status === "playing" && (
            <button
              type="button"
              className={`btn-list sketch-border ${listOpen ? "btn-list--active" : ""}`}
              onClick={onToggleList}
              aria-pressed={listOpen}
            >
              List {state.sortedCount}/{state.totalItems}
            </button>
          )}
          {state.status === "playing" && (
            <button
              type="button"
              className="btn-end-game sketch-border"
              onClick={onEndGame}
            >
              End game
            </button>
          )}
        </div>
      </div>
      <NoiseMeter noise={state.noise} stage={state.monsterStage} />
    </header>
  );
}
