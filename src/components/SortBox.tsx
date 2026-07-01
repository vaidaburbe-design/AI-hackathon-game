import { forwardRef } from "react";
import { SortBoxHint } from "./SortBoxHint";

export type SortBoxFeedback = "reject" | "success" | null;

interface SortBoxProps {
  feedback?: SortBoxFeedback;
  showHint?: boolean;
  hintFading?: boolean;
}

export const SortBox = forwardRef<HTMLDivElement, SortBoxProps>(
  function SortBox({ feedback = null, showHint = false, hintFading = false }, ref) {
    return (
      <div
        ref={ref}
        className={`sort-box ${feedback === "reject" ? "sort-box--reject" : ""} ${feedback === "success" ? "sort-box--success" : ""}`}
      >
        {showHint && <SortBoxHint fading={hintFading} />}
        <div className="sort-box-visual">
          <img
            src="/items/sort-box.png"
            alt="Sort box"
            className="sort-box-image"
            draggable={false}
          />
          {feedback === "reject" && (
            <div
              className="sort-box-feedback sort-box-feedback--reject"
              role="status"
              aria-label="Doesn't fit"
              aria-live="polite"
            >
              <img
                src="/items/sort-reject-x.png"
                alt=""
                className="sort-box-feedback-icon"
                draggable={false}
              />
            </div>
          )}
          {feedback === "success" && (
            <div
              className="sort-box-feedback sort-box-feedback--success"
              role="status"
              aria-label="Fits"
              aria-live="polite"
            >
              <img
                src="/items/sort-success-check.png"
                alt=""
                className="sort-box-feedback-icon"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);
