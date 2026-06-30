import { getItemImage } from "../data/items";
import { isSortableItem } from "../state/gameReducer";
import { DoodleTick } from "./DoodleTick";
import type { ItemInstance } from "../types/game";

interface CollectedItemsProps {
  items: ItemInstance[];
}

export function CollectedItems({ items }: CollectedItemsProps) {
  const sorted = items.filter((item) => item.sorted && isSortableItem(item));
  if (sorted.length === 0) return null;

  return (
    <div className="collected-panel sketch-border" aria-label="Collected items">
      <div className="collected-items">
        {sorted.map((item) => {
        const imageSrc = getItemImage(item.id);
        return (
          <div
            key={item.id}
            className="collected-item"
            title={item.label}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className="collected-item-icon"
                draggable={false}
              />
            ) : (
              <span className="collected-item-emoji">{item.emoji}</span>
            )}
            <DoodleTick className="collected-tick" />
          </div>
        );
      })}
      </div>
    </div>
  );
}
