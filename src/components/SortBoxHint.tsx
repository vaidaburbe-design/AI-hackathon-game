interface SortBoxHintProps {
  fading?: boolean;
}

export function SortBoxHint({ fading = false }: SortBoxHintProps) {
  return (
    <div
      className={`sort-box-hint ${fading ? "sort-box-hint--fading" : ""}`}
      aria-hidden
    >
      <img
        src="/items/sort-hint-arrow.png"
        alt=""
        className="sort-box-hint-arrow"
        draggable={false}
      />
    </div>
  );
}
