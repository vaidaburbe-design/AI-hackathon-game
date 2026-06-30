export const DECOY_ITEM_IDS = ["bell", "chips", "cat"] as const;

export type DecoyItemId = (typeof DECOY_ITEM_IDS)[number];

function shuffle<T>(items: T[]): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function pickDecoysForRound(
  round: number,
  excludeIds: readonly string[] = [],
): DecoyItemId[] {
  const count = round === 1 ? 1 : 2;
  const available = DECOY_ITEM_IDS.filter((id) => !excludeIds.includes(id));
  return shuffle(available).slice(0, Math.min(count, available.length));
}
