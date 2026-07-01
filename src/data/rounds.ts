import { resolveSpawnPosition } from "../systems/spawnPlacement";
import { pickDecoysForRound } from "./decoys";
import { getItem } from "./items";
import type { ItemInstance } from "../types/game";

export interface RoundDefinition {
  round: number;
  title: string;
  description: string;
  sortableItemIds: string[];
  positionOverrides?: Record<string, { x: number; y: number }>;
}

export const ROUNDS: RoundDefinition[] = [
  {
    round: 1,
    title: "Round 1 — Whisper",
    description: "Quiet items scattered everywhere — learn the room.",
    sortableItemIds: ["hoodie", "pillow", "banana", "sock"],
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
    sortableItemIds: ["notebook", "wallet", "remote", "charger"],
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
    sortableItemIds: ["keys", "mug", "laptop", "coins"],
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

export function createRoundItems(
  roundNumber: number,
  excludeDecoyIds: readonly string[] = [],
): ItemInstance[] {
  const round = ROUNDS.find((r) => r.round === roundNumber);
  if (!round) throw new Error(`Unknown round: ${roundNumber}`);

  const occupied: { x: number; y: number }[] = [];

  const sortableItems = round.sortableItemIds.map((id) => {
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

  return [...sortableItems, ...decoyItems];
}

export function getRoundDefinition(roundNumber: number): RoundDefinition {
  const round = ROUNDS.find((r) => r.round === roundNumber);
  if (!round) throw new Error(`Unknown round: ${roundNumber}`);
  return round;
}
