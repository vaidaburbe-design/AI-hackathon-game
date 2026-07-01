import { GAME_CONFIG } from "../config/gameConfig";
import type { ItemDefinition, ItemType } from "../types/game";

const TYPE_MODIFIERS: Record<ItemType, number> = {
  soft: 0.5,
  crinkly: 1.2,
  jingly: 1.5,
  fragile: 1.3,
  heavy: 1.1,
};

type RoomNoiseZone = (typeof GAME_CONFIG.roomNoiseZones)[number];

function pointInZone(zone: RoomNoiseZone, x: number, y: number): boolean {
  switch (zone.shape) {
    case "ellipse": {
      const dx = (x - zone.center.x) / zone.radius.x;
      const dy = (y - zone.center.y) / zone.radius.y;
      return dx * dx + dy * dy <= 1;
    }
    case "rect":
      return (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      );
    case "edge":
      return (
        x <= zone.margin ||
        x >= 100 - zone.margin ||
        y <= zone.margin ||
        y >= 100 - zone.margin
      );
  }
}

export function getProximityMultiplier(x: number, y: number): number {
  let dangerMultiplier = 1;
  let quietMultiplier = 1;

  for (const zone of GAME_CONFIG.roomNoiseZones) {
    if (!pointInZone(zone, x, y)) continue;

    if (zone.multiplier >= 1) {
      dangerMultiplier = Math.max(dangerMultiplier, zone.multiplier);
    } else {
      quietMultiplier = Math.min(quietMultiplier, zone.multiplier);
    }
  }

  return Math.min(
    GAME_CONFIG.proximityMaxMultiplier,
    Math.max(0.3, dangerMultiplier * quietMultiplier),
  );
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
