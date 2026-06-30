import type { GameStatus, MonsterStage } from "../types/game";

const BUTTON_CLICK_SRC = "/sounds/button-click.mp3";
const MONSTER_ROAR_SRC = "/sounds/monster_roar.mp3";
const SNORING_SRC = "/sounds/snoring-loop.wav";

let audioCtx: AudioContext | null = null;
let buttonClickAudio: HTMLAudioElement | null = null;
let monsterRoarAudio: HTMLAudioElement | null = null;
let snoreAudio: HTMLAudioElement | null = null;
let snoreShouldPlay = false;

function getContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function unlockAudioContext() {
  const ctx = getContext();
  if (ctx.state === "suspended") void ctx.resume();
}

function getButtonClickAudio(): HTMLAudioElement {
  if (!buttonClickAudio) {
    buttonClickAudio = new Audio(BUTTON_CLICK_SRC);
    buttonClickAudio.preload = "auto";
  }
  return buttonClickAudio;
}

export function playButtonClick() {
  unlockAudioContext();
  const audio = getButtonClickAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playRejectSound() {
  unlockAudioContext();
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playSuccessSound() {
  unlockAudioContext();
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.09, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.24);
}

export function initButtonClickSound() {
  document.addEventListener(
    "click",
    (event) => {
      const button = (event.target as Element).closest("button");
      if (!button || button.classList.contains("draggable-item")) return;
      playButtonClick();
    },
    true,
  );
}

export function preloadGameAudio() {
  getSnoreAudio().load();
  getMonsterRoarAudio().load();
}

export function stopGameAudio() {
  snoreShouldPlay = false;
  stopSnore();
}

function getSnoreAudio(): HTMLAudioElement {
  if (!snoreAudio) {
    snoreAudio = new Audio(SNORING_SRC);
    snoreAudio.loop = true;
    snoreAudio.preload = "auto";
    snoreAudio.addEventListener("ended", () => {
      if (!snoreShouldPlay || !snoreAudio) return;
      snoreAudio.currentTime = 0;
      void snoreAudio.play().catch(() => {});
    });
  }
  return snoreAudio;
}

function stopSnore() {
  if (!snoreAudio) return;
  snoreAudio.pause();
  snoreAudio.currentTime = 0;
}

function startSnore() {
  unlockAudioContext();
  snoreShouldPlay = true;

  const audio = getSnoreAudio();
  const play = () => {
    if (!snoreShouldPlay || !audio.paused) return;
    void audio.play().catch(() => {});
  };

  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    play();
    return;
  }

  audio.addEventListener("canplaythrough", play, { once: true });
  if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
    audio.load();
  }
}

function updateSnoreForStage(stage: MonsterStage) {
  const audio = getSnoreAudio();

  switch (stage) {
    case "deepSleep":
      audio.volume = 0.65;
      break;
    case "stirring":
      audio.volume = 0.8;
      break;
    case "suspicious":
      audio.volume = 0.95;
      break;
    default:
      break;
  }
}

function getMonsterRoarAudio(): HTMLAudioElement {
  if (!monsterRoarAudio) {
    monsterRoarAudio = new Audio(MONSTER_ROAR_SRC);
    monsterRoarAudio.preload = "auto";
  }
  return monsterRoarAudio;
}

function playWakeSting() {
  unlockAudioContext();
  snoreShouldPlay = false;
  stopSnore();

  const audio = getMonsterRoarAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function resumeGameplayAudio(stage: MonsterStage = "deepSleep") {
  startSnore();
  updateSnoreForStage(stage);
}

export function syncGameAudio(status: GameStatus, stage: MonsterStage) {
  if (stage === "awake") {
    playWakeSting();
    return;
  }

  if (status === "idle") {
    snoreShouldPlay = false;
    stopSnore();
    return;
  }

  if (status === "playing") {
    startSnore();
    updateSnoreForStage(stage);
  }
}
