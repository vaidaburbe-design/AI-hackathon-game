import { getStageColor, getStageLabel } from "../systems/monster";
import type { MonsterStage } from "../types/game";

interface NoiseMeterProps {
  noise: number;
  stage: MonsterStage;
}

export function NoiseMeter({ noise, stage }: NoiseMeterProps) {
  const color = getStageColor(stage);
  const pct = Math.min(100, noise);

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-1 flex items-center justify-between text-sm font-medium">
        <span className="sketch-label doodle-label">~ Noise ~</span>
        <span style={{ color }} className="font-bold tracking-wide">
          {getStageLabel(stage)}
        </span>
      </div>
      <div className="noise-track sketch-border">
        <div
          className="noise-fill transition-[width] duration-150"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className="noise-mark"
            style={{ left: `${mark}%` }}
          />
        ))}
      </div>
      <div className="mt-1 text-right text-xs opacity-60">{Math.round(noise)}%</div>
    </div>
  );
}
