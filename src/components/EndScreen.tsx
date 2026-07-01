import { GAME_CONFIG } from "../config/gameConfig";
import type { LoseReason } from "../types/game";
import { EndScreenArt, getEndScreenArtVariant } from "./EndScreenArt";

interface EndScreenProps {
  won: boolean;
  round: number;
  loseReason?: LoseReason | null;
  onNextRound: () => void;
  onRetry: () => void;
  onRestart: () => void;
}

export function EndScreen({
  won,
  round,
  loseReason = null,
  onNextRound,
  onRetry,
  onRestart,
}: EndScreenProps) {
  const isFinalWin = won && round >= GAME_CONFIG.totalRounds;
  const hasNextRound = won && round < GAME_CONFIG.totalRounds;
  const artVariant = getEndScreenArtVariant(won, isFinalWin, loseReason);

  return (
    <div className="overlay-screen doodle-overlay">
      <div className="overlay-card sketch-border doodle-card">
        <EndScreenArt variant={artVariant} />

        {won ? (
          <h2 className="end-title end-title--win doodle-title">
            {isFinalWin ? "You cleared the room!" : `Round ${round} complete!`}
          </h2>
        ) : (
          <h2 className="end-title end-title--lose doodle-title">
            {loseReason === "time" ? "Time's up!" : "It woke up!"}
          </h2>
        )}

        <div className="end-actions">
          {hasNextRound && (
            <button type="button" className="btn-primary sketch-border" onClick={onNextRound}>
              Next Round
            </button>
          )}
          {!won && (
            <button type="button" className="btn-primary sketch-border" onClick={onRetry}>
              Try Again
            </button>
          )}
          {(isFinalWin || !won) && (
            <button type="button" className="btn-secondary sketch-border" onClick={onRestart}>
              {isFinalWin ? "Play Again" : "Back to Start"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
