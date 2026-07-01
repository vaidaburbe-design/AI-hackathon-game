import { resolveSpawnPosition } from "../systems/spawnPlacement";
import { ITEM_CATALOG, getItem } from "./items";
import type { ItemInstance, ItemNoiseLevel } from "../types/game";

interface RoundItemGroup {
  noiseLevels: ItemNoiseLevel[];
  count: number;
}

export interface RoundDefinition {
  round: number;
  title: string;
  description: string;
  targetGroups: RoundItemGroup[];
  decoyGroups: RoundItemGroup[];
  positionOverrides?: Record<string, { x: number; y: number }>;
}

export const ROUNDS: RoundDefinition[] = [
  {
    round: 1,
    title: "Round 1 — Whisper",
    description: "Quiet items scattered everywhere — learn the room.",
    targetGroups: [
      { noiseLevels: [1], count: 3 },
      { noiseLevels: [2], count: 1 },
    ],
    decoyGroups: [
      { noiseLevels: [1, 2, 3], count: 5 },
    ],
    positionOverrides: {
      hoodie: { x: 90, y: 62 },
      pillow: { x: 12, y: 68 },
      banana: { x: 20, y: 66 },
      sock: { x: 88, y: 72 },
      bell: { x: 8, y: 74 },
      chips: { x: 18, y: 64 },
      cat: { x: 92, y: 66 },
      sponge: { x: 10, y: 60 },
      blanket: { x: 78, y: 66 },
    },
  },
  {
    round: 2,
    title: "Round 2 — Closer",
    description: "More clutter, trickier objects near the sofa.",
    targetGroups: [
      { noiseLevels: [2, 3], count: 3 },
      { noiseLevels: [4], count: 1 },
    ],
    decoyGroups: [
      { noiseLevels: [2, 3, 4, 5], count: 5 },
    ],
    positionOverrides: {
      notebook: { x: 88, y: 60 },
      wallet: { x: 14, y: 62 },
      remote: { x: 20, y: 70 },
      charger: { x: 86, y: 68 },
      phone: { x: 8, y: 66 },
      candle: { x: 92, y: 58 },
      lamp: { x: 12, y: 74 },
      plate: { x: 24, y: 67 },
      broom: { x: 94, y: 72 },
    },
  },
  {
    round: 3,
    title: "Round 3 — Tense",
    description: "The room is packed — loud items everywhere.",
    targetGroups: [
      { noiseLevels: [4, 5], count: 4 },
    ],
    decoyGroups: [
      { noiseLevels: [3, 4, 5], count: 5 },
    ],
    positionOverrides: {
      keys: { x: 16, y: 70 },
      mug: { x: 28, y: 66 },
      laptop: { x: 82, y: 74 },
      coins: { x: 22, y: 64 },
      vacuum: { x: 6, y: 72 },
      "alarm-clock": { x: 90, y: 62 },
      teapot: { x: 76, y: 66 },
      kettle: { x: 88, y: 70 },
      pot: { x: 10, y: 68 },
    },
  },
];

function shuffle<T>(items: T[]): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function pickItemIdsForGroups(
  groups: RoundItemGroup[],
  excludeIds: ReadonlySet<string> = new Set(),
): string[] {
  const picked = new Set<string>();

  return groups.flatMap((group) => {
    const candidates = Object.values(ITEM_CATALOG)
      .filter((item) => group.noiseLevels.includes(item.noiseLevel))
      .filter((item) => !picked.has(item.id))
      .filter((item) => !excludeIds.has(item.id));

    const selected = shuffle(candidates).slice(0, group.count);
    selected.forEach((item) => picked.add(item.id));

    if (selected.length < group.count) {
      throw new Error("Not enough item candidates for round group");
    }

    return selected.map((item) => item.id);
  });
}

export function createRoundItems(
  roundNumber: number,
  excludeDecoyIds: readonly string[] = [],
): ItemInstance[] {
  const round = ROUNDS.find((r) => r.round === roundNumber);
  if (!round) throw new Error(`Unknown round: ${roundNumber}`);

  const occupied: { x: number; y: number }[] = [];
  const targetIds = pickItemIdsForGroups(round.targetGroups);
  const excludedDecoys = new Set([...excludeDecoyIds, ...targetIds]);
  const decoyIds = pickItemIdsForGroups(round.decoyGroups, excludedDecoys);

  const sortableItems = targetIds.map((id) => {
    const def = getItem(id);
    const preferred = round.positionOverrides?.[id] ?? def.position;
    const position = resolveSpawnPosition(preferred, occupied);
    occupied.push(position);

    return {
      ...def,
      position,
      sortable: true,
      sorted: false,
      dragging: false,
    };
  });

  const decoyItems = decoyIds.map((id) => {
    const def = getItem(id);
    const preferred = round.positionOverrides?.[id] ?? def.position;
    const position = resolveSpawnPosition(preferred, occupied);
    occupied.push(position);

    return {
      ...def,
      position,
      sortable: false,
      sorted: false,
      dragging: false,
    };
  });

  return [...sortableItems, ...decoyItems];
}

export function getRoundDefinition(roundNumber: number): RoundDefinition {
  const round = ROUNDS.find((r) => r.round === roundNumber);
  if (!round) throw new Error(`Unknown round: ${roundNumber}`);
  return round;
}
