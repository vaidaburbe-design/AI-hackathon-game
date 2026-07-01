import { useState } from "react";
import {
  preloadGameAudio,
  resumeGameplayAudio,
  stopIntroMusic,
  unlockAudioContext,
} from "../audio/audioManager";
import { preloadGameAssets } from "../assets/preloadGameAssets";

const MIN_LOADING_MS = 2000;

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    unlockAudioContext();
    preloadGameAudio();
    await Promise.all([
      preloadGameAssets(),
      new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_MS)),
    ]);
    stopIntroMusic();
    onStart();
    resumeGameplayAudio("deepSleep");
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
        >
          {loading ? "LOADING" : "PLAY"}
        </button>
      </div>
    </div>
  );
}
