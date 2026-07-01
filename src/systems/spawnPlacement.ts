/** Percent-based zones where draggable items must never spawn (see LivingRoom layout). */
export const SPAWN_FORBIDDEN_ZONES = [
  { id: "monster", xMin: 28, xMax: 72, yMin: 28, yMax: 62 },
  { id: "sortBox", xMin: 18, xMax: 82, yMin: 64, yMax: 98 },
] as const;

const MIN_ITEM_SPACING = 11;
const GRID_STEP = 7;

function clampPercent(value: number): number {
  return Math.max(6, Math.min(94, value));
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function shuffle<T>(items: T[]): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
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

function buildCandidateSlots(): { x: number; y: number }[] {
  const slots: { x: number; y: number }[] = [];

  for (let y = 10; y <= 78; y += GRID_STEP) {
    for (let x = 8; x <= 92; x += GRID_STEP) {
      if (!isInForbiddenSpawnZone(x, y)) {
        slots.push({ x, y });
      }
    }
  }

  return slots;
}

/** Spread items across the whole room with even spacing. */
export function scatterSpawnPositions(count: number): { x: number; y: number }[] {
  if (count <= 0) return [];

  const candidates = shuffle(buildCandidateSlots());
  if (candidates.length === 0) return [];

  const placed: { x: number; y: number }[] = [];
  const seed = candidates[0];
  placed.push(seed);

  while (placed.length < count) {
    let best: { x: number; y: number } | null = null;
    let bestScore = -1;

    for (const candidate of candidates) {
      if (!isValidSpawnPosition(candidate, placed)) continue;

      const score = Math.min(...placed.map((point) => distance(point, candidate)));
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (!best) break;
    placed.push(best);
  }

  if (placed.length < count) {
    for (const candidate of shuffle(candidates)) {
      if (placed.length >= count) break;
      if (isValidSpawnPosition(candidate, placed)) {
        placed.push(candidate);
      }
    }
  }

  return placed.slice(0, count);
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

  for (let radius = GRID_STEP; radius <= 42; radius += GRID_STEP) {
    for (let angle = 0; angle < 360; angle += 24) {
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

  for (const slot of shuffle(buildCandidateSlots())) {
    if (isValidSpawnPosition(slot, occupied)) {
      return slot;
    }
  }

  return clamped;
}
