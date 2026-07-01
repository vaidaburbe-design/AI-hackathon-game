import { GAME_CONFIG, MONSTER_THRESHOLDS } from "../config/gameConfig";
import type { MonsterStage } from "../types/game";

const STAGE_ORDER: MonsterStage[] = [
  "deepSleep",
  "stirring",
  "suspicious",
  "awake",
];

export function noiseToStage(noise: number): MonsterStage {
  if (noise >= MONSTER_THRESHOLDS.awake) return "suspicious";
  if (noise >= MONSTER_THRESHOLDS.suspicious) return "suspicious";
  if (noise >= MONSTER_THRESHOLDS.stirring) return "stirring";
  return "deepSleep";
}

export function getStageLabel(stage: MonsterStage): string {
  switch (stage) {
    case "deepSleep":
      return "Deep Sleep";
    case "stirring":
      return "Stirring…";
    case "suspicious":
      return "Suspicious!";
    case "awake":
      return "AWAKE!";
  }
}

export function settleStage(
  currentStage: MonsterStage,
  noise: number,
  lowNoiseSince: number | null,
  now: number,
): { stage: MonsterStage; lowNoiseSince: number | null } {
  if (noise >= MONSTER_THRESHOLDS.stirring) {
    return { stage: noiseToStage(noise), lowNoiseSince: null };
  }

  if (noise < GAME_CONFIG.settleThreshold) {
    const since = lowNoiseSince ?? now;
    if (now - since >= GAME_CONFIG.settleDelayMs) {
      const idx = STAGE_ORDER.indexOf(currentStage);
      if (idx > 0) {
        return {
          stage: STAGE_ORDER[idx - 1],
          lowNoiseSince: now,
        };
      }
    }
    return { stage: currentStage, lowNoiseSince: since };
  }

  return { stage: noiseToStage(noise), lowNoiseSince: null };
}

export function getStageMeterFloor(stage: MonsterStage): number {
  switch (stage) {
    case "deepSleep":
      return MONSTER_THRESHOLDS.deepSleep;
    case "stirring":
      return MONSTER_THRESHOLDS.stirring;
    case "suspicious":
      return MONSTER_THRESHOLDS.suspicious;
    case "awake":
      return MONSTER_THRESHOLDS.awake;
  }
}

export function getMeterDisplayPercent(
  noise: number,
  stage: MonsterStage,
): number {
  const floor = getStageMeterFloor(stage);
  return Math.min(100, Math.max(noise, floor));
}

export function getStageColor(stage: MonsterStage): string {
  switch (stage) {
    case "deepSleep":
      return "#7ec8a3";
    case "stirring":
      return "#ffd966";
    case "suspicious":
      return "#ffb347";
    case "awake":
      return "#ff6b6b";
  }
}
