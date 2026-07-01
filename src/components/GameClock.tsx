import { getRoundTimeLimitMs } from "../config/gameConfig";

interface GameClockProps {
  timeRemainingMs: number;
  round: number;
  active: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function GameClock({ timeRemainingMs, round, active }: GameClockProps) {
  const limitMs = getRoundTimeLimitMs(round);
  const progress = limitMs > 0 ? timeRemainingMs / limitMs : 0;
  const urgent = active && timeRemainingMs <= 10_000;
  const critical = active && timeRemainingMs <= 5_000;
  const minuteAngle = progress * 360 - 90;
  const hourAngle = progress * 90 - 90;

  return (
    <div
      className={`game-clock sketch-border ${urgent ? "game-clock--urgent" : ""} ${critical ? "game-clock--critical" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining ${formatTime(timeRemainingMs)}`}
    >
      <div className="game-clock-face" aria-hidden>
        <svg viewBox="0 0 64 64" className="game-clock-svg">
          <circle cx="32" cy="32" r="27" className="game-clock-rim" />
          <circle cx="32" cy="32" r="23" className="game-clock-dial" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x1 = 32 + Math.cos(rad) * 18;
            const y1 = 32 + Math.sin(rad) * 18;
            const x2 = 32 + Math.cos(rad) * 21;
            const y2 = 32 + Math.sin(rad) * 21;
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="game-clock-tick"
              />
            );
          })}
          <g transform={`rotate(${minuteAngle} 32 32)`}>
            <line x1="32" y1="32" x2="32" y2="16" className="game-clock-hand game-clock-hand--minute" />
          </g>
          <g transform={`rotate(${hourAngle} 32 32)`}>
            <line x1="32" y1="32" x2="32" y2="22" className="game-clock-hand game-clock-hand--hour" />
          </g>
          <circle cx="32" cy="32" r="2.5" className="game-clock-hub" />
        </svg>
      </div>
      <div className="game-clock-readout">
        <span className="game-clock-label">Time</span>
        <span className="game-clock-time">{formatTime(timeRemainingMs)}</span>
      </div>
    </div>
  );
}
