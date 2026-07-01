import { resolveSpawnPosition } from "../systems/spawnPlacement";
import { pickDecoysForRound } from "./decoys";
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
  itemGroups: RoundItemGroup[];
  positionOverrides?: Record<string, { x: number; y: number }>;
}

export const ROUNDS: RoundDefinition[] = [
  {
    round: 1,
    title: "Round 1 — Whisper",
    description: "Mostly quiet items, with one small step up in noise.",
    itemGroups: [
      { noiseLevels: [1], count: 3 },
      { noiseLevels: [2], count: 1 },
    ],
    positionOverrides: {
      hoodie: { x: 80, y: 24 },
      pillow: { x: 15, y: 28 },
      banana: { x: 25, y: 36 },
      sock: { x: 75, y: 74 },
    },
  },
  {
    round: 2,
    title: "Round 2 — Closer",
    description: "Medium-noise items with one riskier object.",
    itemGroups: [
      { noiseLevels: [2, 3], count: 3 },
      { noiseLevels: [4], count: 1 },
    ],
    positionOverrides: {
      remote: { x: 20, y: 40 },
      charger: { x: 68, y: 58 },
      notebook: { x: 75, y: 35 },
      wallet: { x: 48, y: 45 },
    },
  },
  {
    round: 3,
    title: "Round 3 — Tense",
    description: "High-noise objects that punish careless movement.",
    itemGroups: [
      { noiseLevels: [3, 4], count: 2 },
      { noiseLevels: [5], count: 2 },
    ],
    positionOverrides: {
      keys: { x: 42, y: 62 },
      mug: { x: 35, y: 55 },
      laptop: { x: 58, y: 68 },
      coins: { x: 52, y: 50 },
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

function pickItemIdsForRound(round: RoundDefinition): string[] {
  const picked = new Set<string>();

  return round.itemGroups.flatMap((group) => {
    const candidates = Object.values(ITEM_CATALOG)
      .filter((item) => item.sortable !== false)
      .filter((item) => group.noiseLevels.includes(item.noiseLevel))
      .filter((item) => !picked.has(item.id));

    const selected = shuffle(candidates).slice(0, group.count);
    selected.forEach((item) => picked.add(item.id));

    if (selected.length < group.count) {
      throw new Error(`Not enough items for round ${round.round}`);
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
  const itemIds = pickItemIdsForRound(round);

  const sortableItems = itemIds.map((id) => {
    const def = getItem(id);
    const preferred = round.positionOverrides?.[id] ?? def.position;
    const position = resolveSpawnPosition(preferred, occupied);
    occupied.push(position);

    return {
      ...def,
      position,
      sorted: false,
      dragging: false,
    };
  });

  const decoyItems = pickDecoysForRound(roundNumber, excludeDecoyIds).map((id) => {
    const def = getItem(id);
    const position = resolveSpawnPosition(def.position, occupied);
    occupied.push(position);

    return {
      ...def,
      position,
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
