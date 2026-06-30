import { resolveSpawnPosition } from "../systems/spawnPlacement";
import { pickDecoysForRound } from "./decoys";
import { getItem } from "./items";
import type { ItemInstance } from "../types/game";

export interface RoundDefinition {
  round: number;
  title: string;
  description: string;
  itemIds: string[];
  positionOverrides?: Record<string, { x: number; y: number }>;
}

export const ROUNDS: RoundDefinition[] = [
  {
    round: 1,
    title: "Round 1 — Whisper",
    description: "Quiet items, far from the sofa. Learn the loop.",
    itemIds: ["hoodie", "pillow", "banana", "sock"],
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
    description: "Mixed items creeping nearer the danger zone.",
    itemIds: ["remote", "charger", "notebook", "wallet"],
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
    description: "Heavy, fragile, jingly — right by the sofa.",
    itemIds: ["keys", "mug", "laptop", "coins"],
    positionOverrides: {
      keys: { x: 42, y: 62 },
      mug: { x: 35, y: 55 },
      laptop: { x: 58, y: 68 },
      coins: { x: 52, y: 50 },
    },
  },
];

export function createRoundItems(
  roundNumber: number,
  excludeDecoyIds: readonly string[] = [],
): ItemInstance[] {
  const round = ROUNDS.find((r) => r.round === roundNumber);
  if (!round) throw new Error(`Unknown round: ${roundNumber}`);

  const occupied: { x: number; y: number }[] = [];

  const sortableItems = round.itemIds.map((id) => {
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
