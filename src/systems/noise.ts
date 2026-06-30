import { GAME_CONFIG } from "../config/gameConfig";
import type { ItemDefinition, ItemType } from "../types/game";

const TYPE_MODIFIERS: Record<ItemType, number> = {
  soft: 0.5,
  crinkly: 1.2,
  jingly: 1.5,
  fragile: 1.3,
  heavy: 1.1,
};

export function getProximityMultiplier(x: number, y: number): number {
  const dx = x - GAME_CONFIG.sofaCenter.x;
  const dy = y - GAME_CONFIG.sofaCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const t = Math.max(0, 1 - distance / GAME_CONFIG.proximityDangerRadius);
  return 1 + t * (GAME_CONFIG.proximityMaxMultiplier - 1);
}

export function getSpeedMultiplier(speed: number): number {
  if (speed <= GAME_CONFIG.speedNoiseThreshold) return 0.3;
  const excess = Math.min(speed - GAME_CONFIG.speedNoiseThreshold, 2);
  return 0.3 + (excess / 2) * (GAME_CONFIG.speedMaxMultiplier - 0.3);
}

export function calculateDragNoise(
  item: ItemDefinition,
  speed: number,
  x: number,
  y: number,
  deltaMs: number,
): number {
  const typeMod = TYPE_MODIFIERS[item.type];
  const speedMod = getSpeedMultiplier(speed / item.handlingSpeed);
  const proximityMod = getProximityMultiplier(x, y);

  let noise =
    item.baseNoise * speedMod * proximityMod * typeMod * (deltaMs / 16);

  if (item.type === "jingly" && speed > GAME_CONFIG.speedNoiseThreshold * 1.5) {
    noise *= 1.4;
  }
  if (item.type === "fragile" && speed > GAME_CONFIG.speedNoiseThreshold) {
    noise *= 1.6;
  }
  if (item.type === "heavy") {
    noise *= 1 + (1 - item.handlingSpeed) * 0.5;
  }

  return noise;
}

export function decayNoise(current: number, deltaMs: number): number {
  const decay = (GAME_CONFIG.noiseDecayPerSecond * deltaMs) / 1000;
  return Math.max(0, current - decay);
}

export function clampNoise(value: number): number {
  return Math.min(GAME_CONFIG.maxNoise, Math.max(0, value));
}
