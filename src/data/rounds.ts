import { scatterSpawnPositions } from "../systems/spawnPlacement";
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
}

export const ROUNDS: RoundDefinition[] = [
  {
    round: 1,
    title: "Round 1 — Whisper",
    description: "Quiet items scattered everywhere — learn the room.",
    targetGroups: [{ noiseLevels: [1], count: 3 }],
    decoyGroups: [{ noiseLevels: [1, 2, 3], count: 5 }],
  },
  {
    round: 2,
    title: "Round 2 — Closer",
    description: "More clutter, trickier objects near the sofa.",
    targetGroups: [
      { noiseLevels: [2, 3], count: 3 },
      { noiseLevels: [4], count: 1 },
    ],
    decoyGroups: [{ noiseLevels: [2, 3, 4, 5], count: 5 }],
  },
  {
    round: 3,
    title: "Round 3 — Tense",
    description: "The room is packed — loud items everywhere.",
    targetGroups: [{ noiseLevels: [4, 5], count: 5 }],
    decoyGroups: [{ noiseLevels: [3, 4, 5], count: 5 }],
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

  const targetIds = pickItemIdsForGroups(round.targetGroups);
  const excludedDecoys = new Set([...excludeDecoyIds, ...targetIds]);
  const decoyIds = pickItemIdsForGroups(round.decoyGroups, excludedDecoys);
  const allIds = [...targetIds, ...decoyIds];
  const positions = scatterSpawnPositions(allIds.length);

  const sortableItems = targetIds.map((id, index) => {
    const def = getItem(id);

    return {
      ...def,
      position: positions[index] ?? def.position,
      sortable: true,
      sorted: false,
      dragging: false,
    };
  });

  const decoyItems = decoyIds.map((id, index) => {
    const def = getItem(id);
    const positionIndex = targetIds.length + index;

    return {
      ...def,
      position: positions[positionIndex] ?? def.position,
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
