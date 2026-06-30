import { useEffect, useRef, useState } from "react";
import { GameHUD } from "./GameHUD";
import { LivingRoom } from "./LivingRoom";
import { StartScreen } from "./StartScreen";
import { EndScreen } from "./EndScreen";
import { InstructionSheet } from "./InstructionSheet";
import { useGame } from "../state/GameContext";
import { useGameLoop } from "../hooks/useGameLoop";
import { syncGameAudio, resumeGameplayAudio } from "../audio/audioManager";

export function GameScreen() {
  const { state, startGame, nextRound, resetGame, endGame, dispatch } = useGame();
  const prevStatus = useRef(state.status);
  const [listOpen, setListOpen] = useState(false);

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

  const handleRetry = () => {
    dispatch({ type: "RETRY_ROUND" });
    resumeGameplayAudio("deepSleep");
  };

  const handleNextRound = () => {
    nextRound();
    resumeGameplayAudio("deepSleep");
  };

  return (
    <div className="game-screen">
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

      {state.status === "lost" && (
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
