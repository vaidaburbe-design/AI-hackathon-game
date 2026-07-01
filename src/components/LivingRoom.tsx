import { useRef, useState } from "react";
import { Creature } from "./Creature";
import { CollectedItems } from "./CollectedItems";
import { DraggableItem } from "./DraggableItem";
import { SortBox, type SortBoxFeedback } from "./SortBox";
import { playRejectSound, playSuccessSound } from "../audio/audioManager";
import { GAME_CONFIG } from "../config/gameConfig";
import { useGame } from "../state/GameContext";
import { isSortableItem } from "../state/gameReducer";
import type { GameState } from "../types/game";

interface LivingRoomProps {
  state: GameState;
}

export function LivingRoom({ state }: LivingRoomProps) {
  const roomRef = useRef<HTMLDivElement>(null);
  const sortBoxRef = useRef<HTMLDivElement>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [boxFeedback, setBoxFeedback] = useState<SortBoxFeedback>(null);
  const { dispatch } = useGame();

  const flashFeedback = (feedback: Exclude<SortBoxFeedback, null>) => {
    if (feedback === "reject") playRejectSound();
    else playSuccessSound();

    setBoxFeedback(feedback);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setBoxFeedback(null), 1000);
  };

  const handleDropInBox = (itemId: string) => {
    const item = state.items.find((entry) => entry.id === itemId);
    if (!item) return;

    if (!isSortableItem(item)) {
      flashFeedback("reject");
      dispatch({ type: "ADD_NOISE", amount: GAME_CONFIG.rejectNoisePenalty });
      dispatch({ type: "SET_DRAGGING", itemId, dragging: false });
      return;
    }

    flashFeedback("success");
    dispatch({ type: "SORT_ITEM", itemId });
  };

  return (
    <div className="living-room" ref={roomRef}>
      <div className="zone zone--coffee sketch-zone doodle-zone" style={{ left: "2%", top: "8%", width: "28%", height: "32%" }}>
        <span className="zone-label">Coffee Table</span>
      </div>
      <div className="zone zone--bookshelf sketch-zone doodle-zone" style={{ right: "2%", top: "6%", width: "24%", height: "38%" }}>
        <span className="zone-label">Bookshelf</span>
      </div>
      <div className="zone zone--back sketch-zone doodle-zone" style={{ left: "30%", top: "2%", width: "40%", height: "18%" }}>
        <span className="zone-label">Back Shelf</span>
      </div>

      <CollectedItems items={state.items} />

      <Creature stage={state.monsterStage} snorePhase={state.snorePhase} />

      {state.items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          roomRef={roomRef}
          sortBoxRef={sortBoxRef}
          onDropInBox={handleDropInBox}
        />
      ))}

      <SortBox ref={sortBoxRef} feedback={boxFeedback} />
    </div>
  );
}
