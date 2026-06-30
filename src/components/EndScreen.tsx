import { GAME_CONFIG } from "../config/gameConfig";

interface EndScreenProps {
  won: boolean;
  round: number;
  onNextRound: () => void;
  onRetry: () => void;
  onRestart: () => void;
}

export function EndScreen({
  won,
  round,
  onNextRound,
  onRetry,
  onRestart,
}: EndScreenProps) {
  const isFinalWin = won && round >= GAME_CONFIG.totalRounds;
  const hasNextRound = won && round < GAME_CONFIG.totalRounds;

  return (
    <div className="overlay-screen doodle-overlay">
      <div className="overlay-card sketch-border doodle-card">
        {won ? (
          <>
            <h2 className={`end-title end-title--win doodle-title ${isFinalWin ? "doodle-title--celebrate" : ""}`}>
              {isFinalWin ? "You cleared the room!" : `Round ${round} complete!`}
            </h2>
            <p className="end-message">
              {isFinalWin
                ? "Every item sorted, creature still snoring. Master of stealth."
                : "The creature settled back down. Ready for something harder?"}
            </p>
          </>
        ) : (
          <>
            <h2 className="end-title end-title--lose doodle-title">It woke up!</h2>
            <p className="end-message">
              Too much noise — the creature is awake and very unhappy. Try
              moving slower, especially near the sofa.
            </p>
          </>
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
