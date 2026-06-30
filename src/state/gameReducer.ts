import { GAME_CONFIG } from "../config/gameConfig";
import { createRoundItems } from "../data/rounds";
import { clampNoise, decayNoise } from "../systems/noise";
import { noiseToStage, settleStage } from "../systems/monster";
import type { GameAction, GameState, ItemInstance } from "../types/game";

const initialState: GameState = {
  noise: 0,
  monsterStage: "deepSleep",
  status: "idle",
  round: 1,
  items: [],
  sortedCount: 0,
  totalItems: 0,
  snorePhase: 0,
  lowNoiseSince: null,
  isDragging: false,
  decoysByRound: {},
};

export function getInitialState(): GameState {
  return { ...initialState };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...getInitialState(),
        status: "playing",
        round: 1,
        ...startRoundState(1),
      };

    case "START_ROUND": {
      const items = action.items;
      return {
        ...state,
        status: "playing",
        round: action.round,
        items,
        sortedCount: 0,
        totalItems: countSortable(items),
        noise: Math.min(state.noise, 15),
        monsterStage: noiseToStage(Math.min(state.noise, 15)),
        lowNoiseSince: null,
        isDragging: false,
        decoysByRound: {
          ...state.decoysByRound,
          [action.round]: getDecoyIds(items),
        },
      };
    }

    case "ADD_NOISE": {
      if (state.status !== "playing") return state;
      const noise = clampNoise(state.noise + action.amount);
      const stage = noiseToStage(noise);
      if (noise >= GAME_CONFIG.awakeThreshold) {
        return {
          ...state,
          noise,
          monsterStage: "awake",
          status: "lost",
          isDragging: false,
          items: state.items.map((i) => ({ ...i, dragging: false })),
        };
      }
      return {
        ...state,
        noise,
        monsterStage: stage,
        lowNoiseSince: null,
      };
    }

    case "TICK": {
      if (state.status !== "playing") return state;
      const now = performance.now();
      let noise = state.noise;
      if (!state.isDragging) {
        noise = decayNoise(noise, action.deltaMs);
      }
      const stageFromNoise = noiseToStage(noise);
      const { stage, lowNoiseSince } = settleStage(
        state.monsterStage,
        noise,
        state.lowNoiseSince,
        now,
      );
      const monsterStage =
        STAGE_RANK[stageFromNoise] > STAGE_RANK[stage]
          ? stageFromNoise
          : stage;
      const snorePhase =
        (state.snorePhase + action.deltaMs * 0.002) % (Math.PI * 2);

      if (noise >= GAME_CONFIG.awakeThreshold) {
        return {
          ...state,
          noise,
          monsterStage: "awake",
          status: "lost",
          snorePhase,
          isDragging: false,
          items: state.items.map((i) => ({ ...i, dragging: false })),
        };
      }

      return {
        ...state,
        noise,
        monsterStage,
        lowNoiseSince,
        snorePhase,
      };
    }

    case "SET_DRAGGING": {
      const items = state.items.map((item) =>
        item.id === action.itemId
          ? {
              ...item,
              dragging: action.dragging,
              dragX: action.x,
              dragY: action.y,
            }
          : { ...item, dragging: false },
      );
      return {
        ...state,
        items,
        isDragging: action.dragging,
      };
    }

    case "UPDATE_DRAG_POSITION": {
      const items = state.items.map((item) =>
        item.id === action.itemId
          ? { ...item, dragX: action.x, dragY: action.y }
          : item,
      );
      return { ...state, items };
    }

    case "SORT_ITEM": {
      const target = state.items.find((item) => item.id === action.itemId);
      if (!target || !isSortableItem(target)) return state;

      const items = state.items.map((item) =>
        item.id === action.itemId
          ? { ...item, sorted: true, dragging: false }
          : item,
      );
      const sortedCount = countSortedSortable(items);
      const allSorted = sortedCount === state.totalItems;
      return {
        ...state,
        items,
        sortedCount,
        isDragging: false,
        status: allSorted ? "won" : state.status,
      };
    }

    case "LOSE":
      return {
        ...state,
        status: "lost",
        monsterStage: "awake",
        isDragging: false,
        items: state.items.map((i) => ({ ...i, dragging: false })),
      };

    case "WIN_ROUND":
      return { ...state, status: "won" };

    case "RETRY_ROUND": {
      const { items, decoysByRound } = buildRoundState(
        state.round,
        state.decoysByRound,
      );
      return {
        ...state,
        status: "playing",
        items,
        decoysByRound,
        sortedCount: 0,
        totalItems: countSortable(items),
        noise: Math.min(state.noise, 15),
        monsterStage: noiseToStage(Math.min(state.noise, 15)),
        lowNoiseSince: null,
        isDragging: false,
      };
    }

    case "RESET":
      return getInitialState();

    default:
      return state;
  }
}

export function isSortableItem(item: { sortable?: boolean }): boolean {
  return item.sortable !== false;
}

function countSortable(items: { sortable?: boolean; sorted?: boolean }[]) {
  return items.filter((item) => isSortableItem(item)).length;
}

function countSortedSortable(items: { sortable?: boolean; sorted?: boolean }[]) {
  return items.filter((item) => isSortableItem(item) && item.sorted).length;
}

const STAGE_RANK = {
  deepSleep: 0,
  stirring: 1,
  suspicious: 2,
  awake: 3,
} as const;

function getExcludedDecoyIds(
  decoysByRound: Partial<Record<number, string[]>>,
  currentRound: number,
): string[] {
  return Object.entries(decoysByRound)
    .filter(([round]) => Number(round) < currentRound)
    .flatMap(([, ids]) => ids ?? []);
}

function getDecoyIds(items: ItemInstance[]): string[] {
  return items.filter((item) => !isSortableItem(item)).map((item) => item.id);
}

function buildRoundState(
  round: number,
  decoysByRound: Partial<Record<number, string[]>>,
) {
  const excludeDecoyIds = getExcludedDecoyIds(decoysByRound, round);
  const items = createRoundItems(round, excludeDecoyIds);
  return {
    items,
    decoysByRound: {
      ...decoysByRound,
      [round]: getDecoyIds(items),
    },
  };
}

function startRoundState(round: number) {
  const { items, decoysByRound } = buildRoundState(round, {});
  return {
    items,
    sortedCount: 0,
    totalItems: countSortable(items),
    decoysByRound,
  };
}

export function advanceRound(state: GameState): GameState | null {
  const nextRound = state.round + 1;
  if (nextRound > GAME_CONFIG.totalRounds) return null;
  const { items, decoysByRound } = buildRoundState(
    nextRound,
    state.decoysByRound,
  );
  return {
    ...state,
    status: "playing",
    round: nextRound,
    items,
    decoysByRound,
    sortedCount: 0,
    totalItems: countSortable(items),
    noise: Math.min(state.noise, 10),
    monsterStage: "deepSleep",
    lowNoiseSince: null,
    isDragging: false,
  };
}
