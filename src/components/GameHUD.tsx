import { NoiseMeter } from "./NoiseMeter";
import type { GameState } from "../types/game";

interface GameHUDProps {
  state: GameState;
  onEndGame: () => void;
  onToggleList: () => void;
  listOpen: boolean;
}

export function GameHUD({ state, onEndGame, onToggleList, listOpen }: GameHUDProps) {
  return (
    <header className="game-hud">
      <div className="hud-top">
        <div className="hud-title-wrap">
          <h1 className="game-title doodle-title">Keep It Quiet · Round {state.round}</h1>
        </div>
      </div>
      <div className="hud-controls">
        <NoiseMeter noise={state.noise} />
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
    </header>
  );
}
