import { getItemImage } from "../data/items";
import { isSortableItem } from "../state/gameReducer";
import type { ItemInstance } from "../types/game";

interface InstructionSheetProps {
  items: ItemInstance[];
  open: boolean;
  onClose: () => void;
}

export function InstructionSheet({
  items,
  open,
  onClose,
}: InstructionSheetProps) {
  if (!open) return null;

  return (
    <div className="instruction-overlay" onClick={onClose}>
      <div
        className="instruction-sheet sketch-border"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Collection list"
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
