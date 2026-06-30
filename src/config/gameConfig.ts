export const GAME_CONFIG = {
  maxNoise: 100,
  noiseDecayPerSecond: 12,
  settleThreshold: 25,
  settleDelayMs: 2000,
  awakeThreshold: 100,
  sofaCenter: { x: 50, y: 58 },
  proximityDangerRadius: 22,
  proximityMaxMultiplier: 2.8,
  speedNoiseThreshold: 0.4,
  speedMaxMultiplier: 2.5,
  debugNoiseAmount: 8,
  totalRounds: 3,
} as const;

export const MONSTER_THRESHOLDS = {
  deepSleep: 0,
  stirring: 26,
  suspicious: 51,
  awake: 76,
} as const;
