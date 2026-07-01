export type EndScreenArtVariant = "time-up" | "noise-wake" | "round-win" | "final-win";

interface EndScreenArtProps {
  variant: EndScreenArtVariant;
}

function TimeUpArt() {
  return (
    <img
      src="/creature/time-up.png"
      alt=""
      className="end-illustration-image"
      draggable={false}
    />
  );
}

function LoseArt() {
  return (
    <img
      src="/creature/sad-lose.png"
      alt=""
      className="end-illustration-image"
      draggable={false}
    />
  );
}

function RoundWinArt() {
  return (
    <img
      src="/creature/round-win-check.png"
      alt=""
      className="end-illustration-image"
      draggable={false}
    />
  );
}

function FinalWinArt() {
  return (
    <img
      src="/creature/happy-win.png"
      alt=""
      className="end-illustration-image"
      draggable={false}
    />
  );
}

export function EndScreenArt({ variant }: EndScreenArtProps) {
  return (
    <div className={`end-illustration end-illustration--${variant}`} aria-hidden>
      {variant === "time-up" && <TimeUpArt />}
      {variant === "noise-wake" && <LoseArt />}
      {variant === "round-win" && <RoundWinArt />}
      {variant === "final-win" && <FinalWinArt />}
    </div>
  );
}

export function getEndScreenArtVariant(
  won: boolean,
  isFinalWin: boolean,
  loseReason: "noise" | "time" | null,
): EndScreenArtVariant {
  if (won) return isFinalWin ? "final-win" : "round-win";
  return loseReason === "time" ? "time-up" : "noise-wake";
}
