import { useEffect, useRef, useState } from "react";
import { getItemImage } from "../data/items";
import { isSortableItem } from "../state/gameReducer";
import type { ItemInstance } from "../types/game";

const SHEET_OPEN_MS = 440;
const SHEET_CLOSE_MS = 440;

export interface ListAnchor {
  x: number;
  y: number;
}

type SheetPhase = "closed" | "opening" | "open" | "closing";

interface InstructionSheetProps {
  items: ItemInstance[];
  open: boolean;
  anchor: ListAnchor | null;
  instantOpen?: boolean;
  onClose: () => void;
}

export function InstructionSheet({
  items,
  open,
  anchor,
  instantOpen = false,
  onClose,
}: InstructionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const consumedInstantRef = useRef(false);
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<SheetPhase>(() =>
    open && instantOpen ? "open" : open ? "opening" : "closed",
  );

  useEffect(() => {
    if (open) {
      setMounted(true);

      if (instantOpen && !consumedInstantRef.current) {
        consumedInstantRef.current = true;
        setPhase("open");
        return;
      }

      let startedOpening = false;
      setPhase((current) => {
        if (current === "open" || current === "opening") return current;
        startedOpening = true;
        return "opening";
      });

      if (!startedOpening) return;

      const openTimer = window.setTimeout(() => {
        setPhase("open");
      }, SHEET_OPEN_MS);

      return () => window.clearTimeout(openTimer);
    }

    if (!mounted) return;

    const sheet = sheetRef.current;
    if (sheet) {
      sheet.getBoundingClientRect();
    }

    setPhase("closing");

    const closeTimer = window.setTimeout(() => {
      setMounted(false);
      setPhase("closed");
      consumedInstantRef.current = false;
    }, SHEET_CLOSE_MS);

    return () => window.clearTimeout(closeTimer);
  }, [open, mounted, instantOpen]);

  if (!mounted) return null;

  const sheetStyle = anchor
    ? ({
        "--list-anchor-x": `${anchor.x}px`,
        "--list-anchor-y": `${anchor.y}px`,
      } as React.CSSProperties)
    : undefined;

  const sheetClassName = [
    "instruction-sheet",
    "sketch-border",
    phase === "opening" && "instruction-sheet--opening",
    phase === "open" && "instruction-sheet--open",
    phase === "closing" && "instruction-sheet--closing",
  ]
    .filter(Boolean)
    .join(" ");

  const overlayClassName =
    phase === "closing"
      ? "instruction-overlay instruction-overlay--closing"
      : phase === "opening"
        ? "instruction-overlay instruction-overlay--opening"
        : "instruction-overlay instruction-overlay--open";

  return (
    <div
      className={overlayClassName}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={sheetClassName}
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Collection list"
        aria-modal="true"
      >
        <h2 className="instruction-title doodle-title">Collect only these!</h2>
        <p className="instruction-subtitle">
          Drag each item into the sort box — quietly!
        </p>
        <ul className="instruction-list">
          {items.filter(isSortableItem).map((item) => (
            <li
              key={item.id}
              className={`instruction-item ${item.sorted ? "instruction-item--done" : ""}`}
            >
              {getItemImage(item.id) ? (
                <img
                  src={getItemImage(item.id)}
                  alt=""
                  className="instruction-item-image"
                  draggable={false}
                />
              ) : (
                <span className="instruction-emoji">{item.emoji}</span>
              )}
              <span className="instruction-label">{item.label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-primary sketch-border instruction-close"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
