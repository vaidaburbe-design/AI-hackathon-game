import { getMeterDisplayPercent, getStageMeterFloor } from "../systems/monster";
import type { MonsterStage } from "../types/game";

interface NoiseMeterProps {
  noise: number;
  stage: MonsterStage;
}

export function NoiseMeter({ noise, stage }: NoiseMeterProps) {
  const displayPct = getMeterDisplayPercent(noise, stage);
  const stageFloorPct = getStageMeterFloor(stage);

  return (
    <div className="noise-meter">
      <div className="noise-meter-labels">
        <span className="noise-meter-label noise-meter-label--left sketch-label doodle-label">
          Asleep
        </span>
        <span className="noise-meter-label noise-meter-label--right sketch-label doodle-label">
          Awake
        </span>
      </div>
      <div className="noise-track sketch-border">
        {stageFloorPct > 0 && (
          <div
            className="noise-stage-floor"
            style={{ left: `${stageFloorPct}%` }}
            aria-hidden
          />
        )}
        <div
          className="noise-empty transition-[left] duration-150"
          style={{ left: `${displayPct}%` }}
        />
      </div>
    </div>
  );
}
