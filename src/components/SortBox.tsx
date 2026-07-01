import { forwardRef } from "react";
import { DoodleRejectX } from "./DoodleRejectX";

export type SortBoxFeedback = "reject" | "success" | null;

interface SortBoxProps {
  feedback?: SortBoxFeedback;
}

export const SortBox = forwardRef<HTMLDivElement, SortBoxProps>(
  function SortBox({ feedback = null }, ref) {
    return (
      <div
        ref={ref}
        className={`sort-box ${feedback === "reject" ? "sort-box--reject" : ""} ${feedback === "success" ? "sort-box--success" : ""}`}
      >
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
              <DoodleRejectX />
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
                className="sort-box-success-icon"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);
