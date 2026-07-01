export const DECOY_ITEM_IDS = [
  "bell",
  "chips",
  "cat",
  "vacuum",
  "broom",
  "blanket",
  "phone",
  "alarm-clock",
  "candle",
  "lamp",
  "sponge",
  "teapot",
  "kettle",
  "pot",
  "plate",
] as const;

export type DecoyItemId = (typeof DECOY_ITEM_IDS)[number];

/** Five decoys per round — all 15 used exactly once across three rounds. */
export const DECOYS_BY_ROUND: Record<number, readonly DecoyItemId[]> = {
  1: ["bell", "chips", "cat", "sponge", "blanket"],
  2: ["phone", "candle", "lamp", "plate", "broom"],
  3: ["vacuum", "alarm-clock", "teapot", "kettle", "pot"],
};

export function pickDecoysForRound(
  round: number,
  _excludeIds: readonly string[] = [],
): DecoyItemId[] {
  return [...(DECOYS_BY_ROUND[round] ?? [])];
}
