import { useEffect, useRef, useState } from "react";
import { GameHUD } from "./GameHUD";
import { LivingRoom } from "./LivingRoom";
import { StartScreen } from "./StartScreen";
import { EndScreen } from "./EndScreen";
import { InstructionSheet } from "./InstructionSheet";
import { useGame } from "../state/GameContext";
import { useGameLoop } from "../hooks/useGameLoop";
import {
  isAudioMuted,
  resumeGameplayAudio,
  setAudioMuted,
  syncGameAudio,
} from "../audio/audioManager";

const LOST_MODAL_DELAY_MS = 3000;

export function GameScreen() {
  const { state, startGame, nextRound, resetGame, endGame, dispatch } = useGame();
  const prevStatus = useRef(state.status);
  const [listOpen, setListOpen] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [muted, setMuted] = useState(isAudioMuted);

  useGameLoop();

  useEffect(() => {
    if (state.status === "playing" && prevStatus.current !== "playing") {
      setListOpen(true);
    }
    if (state.status === "idle") {
      setListOpen(false);
    }
    prevStatus.current = state.status;
  }, [state.status]);

  useEffect(() => {
    syncGameAudio(state.status, state.monsterStage);
  }, [state.monsterStage, state.status]);

  useEffect(() => {
    if (state.status !== "lost") {
      setShowLostModal(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLostModal(true);
    }, LOST_MODAL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [state.status]);

  const handleRetry = () => {
    dispatch({ type: "RETRY_ROUND" });
    resumeGameplayAudio("deepSleep");
  };

  const handleNextRound = () => {
    nextRound();
    resumeGameplayAudio("deepSleep");
  };

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setAudioMuted(nextMuted);

    if (!nextMuted) {
      syncGameAudio(state.status, state.monsterStage);
    }
  };

  return (
    <div className="game-screen">
      <button
        type="button"
        className="mute-toggle"
        onClick={handleToggleMute}
        aria-label={muted ? "Unmute audio" : "Mute audio"}
        aria-pressed={muted}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" />
            <path d="m17 9 4 4m0-4-4 4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" />
            <path d="M16 8.5c1.2 1 2 2.1 2 3.5s-.8 2.6-2 3.5" />
            <path d="M18.5 6c1.8 1.5 3 3.5 3 6s-1.2 4.5-3 6" />
          </svg>
        )}
      </button>

      {state.status === "idle" && <StartScreen onStart={startGame} />}

      {(state.status === "playing" || state.status === "won" || state.status === "lost") && (
        <>
          <GameHUD
            state={state}
            onEndGame={endGame}
            onToggleList={() => setListOpen((open) => !open)}
            listOpen={listOpen}
          />
          <LivingRoom state={state} />
          {state.status === "playing" && (
            <InstructionSheet
              items={state.items}
              round={state.round}
              open={listOpen}
              onClose={() => setListOpen(false)}
            />
          )}
        </>
      )}

      {state.status === "won" && (
        <EndScreen
          won
          round={state.round}
          onNextRound={handleNextRound}
          onRetry={handleRetry}
          onRestart={resetGame}
        />
      )}

      {state.status === "lost" && showLostModal && (
        <EndScreen
          won={false}
          round={state.round}
          onNextRound={handleNextRound}
          onRetry={handleRetry}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
