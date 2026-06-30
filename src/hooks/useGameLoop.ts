import { useEffect } from "react";
import { useGame } from "../state/GameContext";

export function useGameLoop() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.status !== "playing") return;

    let last = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const deltaMs = Math.min(now - last, 50);
      last = now;
      dispatch({ type: "TICK", deltaMs });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [state.status, dispatch]);
}
