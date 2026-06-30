import { unlockAudioContext, preloadGameAudio, resumeGameplayAudio } from "../audio/audioManager";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const handleStart = () => {
    unlockAudioContext();
    preloadGameAudio();
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
        <button type="button" className="btn-primary btn-primary--start sketch-border" onClick={handleStart}>
          PLAY
        </button>
      </div>
    </div>
  );
}
