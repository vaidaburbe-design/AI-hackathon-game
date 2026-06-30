/** Percent-based zones where draggable items must never spawn (see LivingRoom layout). */
export const SPAWN_FORBIDDEN_ZONES = [
  { id: "monster", xMin: 30, xMax: 70, yMin: 32, yMax: 58 },
  { id: "sortBox", xMin: 22, xMax: 78, yMin: 68, yMax: 98 },
] as const;

const MIN_ITEM_SPACING = 10;

const FALLBACK_SPAWN_SLOTS: { x: number; y: number }[] = [
  { x: 15, y: 28 },
  { x: 25, y: 36 },
  { x: 18, y: 22 },
  { x: 80, y: 24 },
  { x: 75, y: 35 },
  { x: 85, y: 38 },
  { x: 35, y: 12 },
  { x: 55, y: 12 },
  { x: 65, y: 12 },
  { x: 12, y: 55 },
  { x: 22, y: 62 },
  { x: 88, y: 58 },
  { x: 78, y: 62 },
  { x: 30, y: 62 },
  { x: 68, y: 62 },
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
    y: clampPercent(preferred.y),
  };

  if (isValidSpawnPosition(clamped, occupied)) {
    return clamped;
  }

  for (let radius = 5; radius <= 45; radius += 5) {
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      const candidate = {
        x: clampPercent(clamped.x + Math.cos(rad) * radius),
        y: clampPercent(clamped.y + Math.sin(rad) * radius),
      };
      if (isValidSpawnPosition(candidate, occupied)) {
        return candidate;
      }
    }
  }

  for (const slot of FALLBACK_SPAWN_SLOTS) {
    if (isValidSpawnPosition(slot, occupied)) {
      return slot;
    }
  }

  return clamped;
}
