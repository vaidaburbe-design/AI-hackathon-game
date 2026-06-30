import { useRef, useState, useCallback } from "react";
import { useGame } from "../state/GameContext";
import { useDragNoise } from "../hooks/useDragNoise";
import { getProximityMultiplier } from "../systems/noise";
import { getItemImage } from "../data/items";
import type { ItemInstance } from "../types/game";

interface DraggableItemProps {
  item: ItemInstance;
  roomRef: React.RefObject<HTMLDivElement | null>;
  onDropInBox: (itemId: string) => void;
  sortBoxRef: React.RefObject<HTMLDivElement | null>;
}

export function DraggableItem({
  item,
  roomRef,
  onDropInBox,
  sortBoxRef,
}: DraggableItemProps) {
  const { dispatch } = useGame();
  const { onDragMove, resetDragTracking } = useDragNoise();
  const [rattle, setRattle] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const getPercentPos = useCallback(
    (clientX: number, clientY: number) => {
      const room = roomRef.current;
      if (!room) return { x: item.position.x, y: item.position.y };
      const rect = room.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      return { x, y };
    },
    [roomRef, item.position],
  );

  const isOverSortBox = useCallback(
    (clientX: number, clientY: number) => {
      const box = sortBoxRef.current;
      if (!box) return false;
      const rect = box.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    },
    [sortBoxRef],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (item.sorted) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = getPercentPos(e.clientX, e.clientY);
    dragOffset.current = {
      x: e.clientX - (roomRef.current?.getBoundingClientRect().left ?? 0),
      y: e.clientY - (roomRef.current?.getBoundingClientRect().top ?? 0),
    };
    dispatch({
      type: "SET_DRAGGING",
      itemId: item.id,
      dragging: true,
      x: pos.x,
      y: pos.y,
    });
    resetDragTracking();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!item.dragging) return;
    const pos = getPercentPos(e.clientX, e.clientY);
    onDragMove(item, pos.x, pos.y);
    if (item.type === "jingly") {
      setRattle(true);
      setTimeout(() => setRattle(false), 100);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!item.dragging) return;
    if (isOverSortBox(e.clientX, e.clientY)) {
      onDropInBox(item.id);
    } else {
      dispatch({
        type: "SET_DRAGGING",
        itemId: item.id,
        dragging: false,
      });
    }
    resetDragTracking();
  };

  if (item.sorted) return null;

  const x = item.dragging ? (item.dragX ?? item.position.x) : item.position.x;
  const y = item.dragging ? (item.dragY ?? item.position.y) : item.position.y;
  const proximity = getProximityMultiplier(x, y);
  const danger = proximity > 1.5;
  const imageSrc = getItemImage(item.id);

  return (
    <button
      type="button"
      className={`draggable-item item--${item.type} ${imageSrc ? "draggable-item--image" : "sketch-border"} ${item.dragging ? "dragging" : ""} ${rattle ? "rattle" : ""} ${danger ? "danger" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: item.dragging ? 50 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label={`Pick up ${item.label}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className={`item-image ${item.id === "charger" || item.id === "remote" ? "item-image--wide" : ""} ${item.id === "laptop" ? "item-image--laptop" : ""} ${item.id === "hoodie" ? "item-image--hoodie" : ""} ${item.id === "coins" ? "item-image--coins" : ""} ${item.id === "bell" ? "item-image--bell" : ""} ${item.id === "chips" ? "item-image--chips" : ""} ${item.id === "cat" ? "item-image--cat" : ""}`}
          draggable={false}
        />
      ) : (
        <>
          <span className="item-emoji">{item.emoji}</span>
          <span className="item-label">{item.label}</span>
        </>
      )}
    </button>
  );
}
