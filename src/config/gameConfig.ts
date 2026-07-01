export const GAME_CONFIG = {
  maxNoise: 100,
  noiseDecayPerSecond: 12,
  settleThreshold: 25,
  settleDelayMs: 2000,
  awakeSustainMs: 1400,
  awakeThreshold: 100,
  sofaCenter: { x: 50, y: 58 },
  proximityDangerRadius: 22,
  proximityMaxMultiplier: 2.8,
  roomNoiseZones: [
    {
      id: "quiet-rug",
      shape: "ellipse",
      center: { x: 50, y: 74 },
      radius: { x: 28, y: 17 },
      multiplier: 0.75,
    },
    {
      id: "safe-outer-edge",
      shape: "edge",
      margin: 7,
      multiplier: 0.9,
    },
    {
      id: "coffee-table-clutter",
      shape: "rect",
      x: 0,
      y: 74,
      width: 34,
      height: 26,
      multiplier: 1.6,
    },
    {
      id: "sofa-danger",
      shape: "rect",
      x: 22,
      y: 32,
      width: 58,
      height: 30,
      multiplier: 1.9,
    },
    {
      id: "monster-reach",
      shape: "ellipse",
      center: { x: 55, y: 43 },
      radius: { x: 24, y: 14 },
      multiplier: 2.8,
    },
  ],
  speedNoiseThreshold: 0.4,
  speedMaxMultiplier: 2.5,
  bellPickupNoisePenalty: 55,
  alarmClockPickupNoisePenalty: 65,
  alarmClockRejectNoisePenalty: 45,
  catPickupNoisePenalty: 28,
  rejectNoisePenalty: 18,
  debugNoiseAmount: 8,
  totalRounds: 3,
  roundTimeMs: {
    1: 45_000,
    2: 35_000,
    3: 25_000,
  },
} as const;

export function getRoundTimeLimitMs(round: number): number {
  const limits = GAME_CONFIG.roundTimeMs;
  return limits[round as keyof typeof limits] ?? limits[3];
}

export const MONSTER_THRESHOLDS = {
  deepSleep: 0,
  stirring: 26,
  suspicious: 51,
  awake: 76,
} as const;
