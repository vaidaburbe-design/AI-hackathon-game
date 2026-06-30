import { useRef, useCallback } from "react";
import { calculateDragNoise } from "../systems/noise";
import { useGame } from "../state/GameContext";
import type { ItemInstance } from "../types/game";

export function useDragNoise() {
  const { dispatch } = useGame();
  const lastPos = useRef<{ x: number; y: number; time: number } | null>(null);

  const onDragMove = useCallback(
    (item: ItemInstance, x: number, y: number) => {
      const now = performance.now();
      const last = lastPos.current;
      let speed = 0;

      if (last) {
        const dt = now - last.time;
        if (dt > 0) {
          const dx = x - last.x;
          const dy = y - last.y;
          speed = Math.sqrt(dx * dx + dy * dy) / dt;
        }
      }

      lastPos.current = { x, y, time: now };
      const deltaMs = last ? now - last.time : 16;
      const noise = calculateDragNoise(item, speed, x, y, deltaMs);

      if (noise > 0.01) {
        dispatch({ type: "ADD_NOISE", amount: noise });
      }

      dispatch({ type: "UPDATE_DRAG_POSITION", itemId: item.id, x, y });
    },
    [dispatch],
  );

  const resetDragTracking = useCallback(() => {
    lastPos.current = null;
  }, []);

  return { onDragMove, resetDragTracking };
}
