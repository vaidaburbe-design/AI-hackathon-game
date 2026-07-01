export type MonsterStage = "deepSleep" | "stirring" | "suspicious" | "awake";
export type GameStatus = "idle" | "playing" | "won" | "lost";
export type LoseReason = "noise" | "time";
export type ItemType = "soft" | "crinkly" | "jingly" | "fragile" | "heavy";
export type ItemTier = "easy" | "medium" | "hard";
export type ItemNoiseLevel = 1 | 2 | 3 | 4 | 5;
export type RoomZone = "coffeeTable" | "bookshelf" | "backShelf" | "floor";

export interface ItemDefinition {
  id: string;
  label: string;
  tier: ItemTier;
  type: ItemType;
  noiseLevel: ItemNoiseLevel;
  baseNoise: number;
  zone: RoomZone;
  position: { x: number; y: number };
  handlingSpeed: number;
  emoji: string;
  image?: string;
  sortable?: boolean;
}

export interface ItemInstance extends ItemDefinition {
  sorted: boolean;
  dragging: boolean;
  dragX?: number;
  dragY?: number;
}

export interface GameState {
  noise: number;
  monsterStage: MonsterStage;
  status: GameStatus;
  round: number;
  items: ItemInstance[];
  sortedCount: number;
  totalItems: number;
  snorePhase: number;
  lowNoiseSince: number | null;
  highNoiseSince: number | null;
  isDragging: boolean;
  decoysByRound: Partial<Record<number, string[]>>;
  timeRemainingMs: number;
  loseReason: LoseReason | null;
}

export type GameAction =
  | { type: "START_ROUND"; round: number; items: ItemInstance[] }
  | { type: "START_GAME" }
  | { type: "ADD_NOISE"; amount: number }
  | { type: "TICK"; deltaMs: number }
  | { type: "SET_DRAGGING"; itemId: string; dragging: boolean; x?: number; y?: number }
  | { type: "UPDATE_DRAG_POSITION"; itemId: string; x: number; y: number }
  | { type: "SORT_ITEM"; itemId: string }
  | { type: "LOSE" }
  | { type: "WIN_ROUND" }
  | { type: "RETRY_ROUND" }
  | { type: "RESET" };
