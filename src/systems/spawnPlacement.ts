/** Prefer spawning on the floor and lower furniture — not floating in a single row. */
export const SPAWN_PREFERRED_Y_MIN = 55;

/** Percent-based zones where draggable items must never spawn (see LivingRoom layout). */
export const SPAWN_FORBIDDEN_ZONES = [
  { id: "monster", xMin: 30, xMax: 70, yMin: 32, yMax: 58 },
  { id: "sortBox", xMin: 22, xMax: 78, yMin: 68, yMax: 98 },
] as const;

const MIN_ITEM_SPACING = 7;

const FALLBACK_SPAWN_SLOTS: { x: number; y: number }[] = [
  { x: 8, y: 72 },
  { x: 12, y: 66 },
  { x: 16, y: 74 },
  { x: 20, y: 60 },
  { x: 24, y: 67 },
  { x: 10, y: 68 },
  { x: 18, y: 70 },
  { x: 88, y: 72 },
  { x: 92, y: 66 },
  { x: 86, y: 74 },
  { x: 82, y: 60 },
  { x: 78, y: 67 },
  { x: 90, y: 68 },
  { x: 94, y: 70 },
  { x: 14, y: 62 },
  { x: 88, y: 64 },
  { x: 6, y: 70 },
  { x: 96, y: 68 },
  { x: 22, y: 64 },
  { x: 76, y: 66 },
];

function clampPercent(value: number): number {
  return Math.max(5, Math.min(95, value));
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isInForbiddenSpawnZone(x: number, y: number): boolean {
  return SPAWN_FORBIDDEN_ZONES.some(
    (zone) => x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax,
  );
}

function isTooCloseToOthers(
  pos: { x: number; y: number },
  occupied: { x: number; y: number }[],
): boolean {
  return occupied.some((other) => distance(pos, other) < MIN_ITEM_SPACING);
}

export function isValidSpawnPosition(
  pos: { x: number; y: number },
  occupied: { x: number; y: number }[] = [],
): boolean {
  return !isInForbiddenSpawnZone(pos.x, pos.y) && !isTooCloseToOthers(pos, occupied);
}

export function resolveSpawnPosition(
  preferred: { x: number; y: number },
  occupied: { x: number; y: number }[] = [],
): { x: number; y: number } {
  const clamped = {
    x: clampPercent(preferred.x),
    y: clampPercent(Math.max(SPAWN_PREFERRED_Y_MIN, preferred.y)),
  };

  if (isValidSpawnPosition(clamped, occupied)) {
    return clamped;
  }

  const candidates: { x: number; y: number }[] = [];

  for (let radius = 4; radius <= 36; radius += 4) {
    for (let angle = 0; angle < 360; angle += 22) {
      const rad = (angle * Math.PI) / 180;
      const candidate = {
        x: clampPercent(clamped.x + Math.cos(rad) * radius),
        y: clampPercent(
          Math.max(SPAWN_PREFERRED_Y_MIN, clamped.y + Math.sin(rad) * radius),
        ),
      };
      if (isValidSpawnPosition(candidate, occupied)) {
        candidates.push(candidate);
      }
    }
  }

  if (candidates.length > 0) {
    return candidates.reduce((best, candidate) =>
      candidate.y > best.y ? candidate : best,
    );
  }

  for (const slot of FALLBACK_SPAWN_SLOTS) {
    if (isValidSpawnPosition(slot, occupied)) {
      return slot;
    }
  }

  return clamped;
}
