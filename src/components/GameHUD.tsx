import { NoiseMeter } from "./NoiseMeter";
import { GameClock } from "./GameClock";
import type { GameState } from "../types/game";

interface GameHUDProps {
  state: GameState;
  onEndGame: () => void;
  onToggleList: () => void;
  listOpen: boolean;
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="btn-icon" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function EndGameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="btn-icon" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
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
        <GameClock
          timeRemainingMs={state.timeRemainingMs}
          round={state.round}
          active={state.status === "playing"}
        />
        <NoiseMeter noise={state.noise} stage={state.monsterStage} />
        <div className="hud-actions">
          <button
            type="button"
            className={`btn-list sketch-border ${listOpen ? "btn-list--active" : ""}`}
            onClick={onToggleList}
            aria-pressed={listOpen}
          >
            <ListIcon />
            <span>List {state.sortedCount}/{state.totalItems}</span>
          </button>
          <button
            type="button"
            className="btn-end-game sketch-border"
            onClick={onEndGame}
          >
            <EndGameIcon />
            <span>End game</span>
          </button>
        </div>
      </div>
    </header>
  );
}
