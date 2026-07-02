import { useEffect, useState } from "react";
import {
  playIntroMusic,
  preloadIntroAudio,
  preloadGameAudio,
  resumeGameplayAudio,
  unlockAudioContext,
} from "../audio/audioManager";
import { preloadGameAssets } from "../assets/preloadGameAssets";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    preloadIntroAudio();
    playIntroMusic();

    const startIntroOnGesture = () => {
      playIntroMusic();
    };

    window.addEventListener("click", startIntroOnGesture);
    window.addEventListener("touchstart", startIntroOnGesture, { passive: true });
    window.addEventListener("keydown", startIntroOnGesture);

    return () => {
      window.removeEventListener("click", startIntroOnGesture);
      window.removeEventListener("touchstart", startIntroOnGesture);
      window.removeEventListener("keydown", startIntroOnGesture);
    };
  }, []);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    unlockAudioContext();
    preloadGameAudio();
    resumeGameplayAudio("deepSleep");
    await preloadGameAssets();
    onStart();
  };

  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <h1 className="game-title-lg doodle-title">Keep It Quiet</h1>
        <p className="start-screen-pitch">
          Wake the monster and you lose the game.
        </p>
        <button
          type="button"
          className="btn-primary btn-primary--start sketch-border"
          onClick={handleStart}
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? "Loading" : "Play"}
        >
          <span className="btn-primary--start-inner">
            <span
              className={`btn-primary--start-label${loading ? " is-hidden" : ""}`}
              aria-hidden={loading}
            >
              PLAY
            </span>
            <span
              className={`btn-primary--start-spinner${loading ? " is-visible" : ""}`}
              aria-hidden={!loading}
            >
              <span className="btn-spinner" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
