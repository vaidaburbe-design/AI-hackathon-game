import { useRef, useState, useCallback, useEffect } from "react";
import { GameHUD } from "./GameHUD";
import { LivingRoom } from "./LivingRoom";
import { StartScreen } from "./StartScreen";
import { EndScreen } from "./EndScreen";
import { InstructionSheet, type ListAnchor } from "./InstructionSheet";
import { useGame } from "../state/GameContext";
import { useGameLoop } from "../hooks/useGameLoop";
import {
  isAudioMuted,
  resumeGameplayAudio,
  setAudioMuted,
  syncGameAudio,
} from "../audio/audioManager";

const LOST_MODAL_DELAY_MS = 5400;

export function GameScreen() {
  const { state, startGame, nextRound, resetGame, endGame, dispatch } = useGame();
  const prevStatus = useRef(state.status);
  const listButtonRef = useRef<HTMLButtonElement>(null);
  const [listOpen, setListOpen] = useState(false);
  const [listOpenInstant, setListOpenInstant] = useState(false);
  const [listAnchor, setListAnchor] = useState<ListAnchor | null>(null);
  const [showLostModal, setShowLostModal] = useState(false);
  const [muted, setMuted] = useState(isAudioMuted);

  const updateListAnchor = useCallback(() => {
    const button = listButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setListAnchor({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, []);

  const handleCloseList = useCallback(() => {
    updateListAnchor();
    setListOpen(false);
  }, [updateListAnchor]);

  const handleToggleList = () => {
    updateListAnchor();
    setListOpen((open) => !open);
  };

  useEffect(() => {
    if (!listOpen) return;

    updateListAnchor();
    window.addEventListener("resize", updateListAnchor);
    return () => window.removeEventListener("resize", updateListAnchor);
  }, [listOpen, updateListAnchor]);

  const endModalVisible =
    state.status === "won" || (state.status === "lost" && showLostModal);

  useGameLoop();

  useEffect(() => {
    if (endModalVisible) {
      setListOpen(false);
    }
  }, [endModalVisible]);

  useEffect(() => {
    if (state.status === "playing" && prevStatus.current !== "playing") {
      window.requestAnimationFrame(updateListAnchor);
      if (prevStatus.current === "idle") {
        setListOpenInstant(true);
      }
      setListOpen(true);
    }
    if (state.status === "idle") {
      setListOpen(false);
      setListOpenInstant(false);
    }
    prevStatus.current = state.status;
  }, [state.status, updateListAnchor]);

  useEffect(() => {
    syncGameAudio(state.status, state.monsterStage, state.loseReason);
  }, [state.loseReason, state.monsterStage, state.status]);

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
            onToggleList={handleToggleList}
            listOpen={listOpen}
            listButtonRef={listButtonRef}
          />
          <LivingRoom state={state} />
          {!endModalVisible && (
            <InstructionSheet
              items={state.items}
              open={listOpen}
              anchor={listAnchor}
              instantOpen={listOpenInstant}
              onClose={handleCloseList}
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
          loseReason={state.loseReason}
          onNextRound={handleNextRound}
          onRetry={handleRetry}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
