import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { stopGameAudio } from "../audio/audioManager";
import { GAME_CONFIG } from "../config/gameConfig";
import { advanceRound, gameReducer, getInitialState } from "./gameReducer";
import type { GameAction, GameState } from "../types/game";

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  addDebugNoise: () => void;
  nextRound: () => void;
  resetGame: () => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);

  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, []);

  const addDebugNoise = useCallback(() => {
    dispatch({ type: "ADD_NOISE", amount: GAME_CONFIG.debugNoiseAmount });
  }, []);

  const nextRound = useCallback(() => {
    const next = advanceRound(state);
    if (next) {
      dispatch({
        type: "START_ROUND",
        round: next.round,
        items: next.items,
      });
    }
  }, [state]);

  const resetGame = useCallback(() => {
    stopGameAudio();
    dispatch({ type: "RESET" });
  }, []);

  const endGame = useCallback(() => {
    stopGameAudio();
    dispatch({ type: "RESET" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      startGame,
      addDebugNoise,
      nextRound,
      resetGame,
      endGame,
    }),
    [state, startGame, addDebugNoise, nextRound, resetGame, endGame],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
