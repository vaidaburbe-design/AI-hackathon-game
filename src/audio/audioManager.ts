import type { GameStatus, LoseReason, MonsterStage } from "../types/game";

const ALARM_CLOCK_PICKUP_SRC = "/sounds/clock_alarm.mp3";
const BELL_PICKUP_SRC = "/sounds/bell_sound.wav";
const BUTTON_CLICK_SRC = "/sounds/button-click.mp3";
const CAT_PICKUP_SRC = "/sounds/cat_sound.mp3";
const COINS_PICKUP_SRC = "/sounds/coins_drop.mp3";
const INTRO_SONG_SRC = "/sounds/intro_song.mp3";
const KEY_PICKUP_SRC = "/sounds/key_rattle.wav";
const MONSTER_ROAR_SRC = "/sounds/monster_roar.mp3";
const MUG_PICKUP_SRC = "/sounds/clink.wav";
const PACKAGE_PICKUP_SRC = "/sounds/package_sound.mp3";
const PHONE_PICKUP_SRC = "/sounds/phone_ring.wav";
const SNORING_SRC = "/sounds/sleeping_breathing.mp3";
const VACUUM_PICKUP_SRC = "/sounds/hoover.mp3";
const KETTLE_PICKUP_SRC = "/sounds/kettle-boiling.wav";
const INTRO_START_TIME = 22;

let audioCtx: AudioContext | null = null;
let alarmClockPickupAudio: HTMLAudioElement | null = null;
let bellPickupAudio: HTMLAudioElement | null = null;
let buttonClickAudio: HTMLAudioElement | null = null;
let catPickupAudio: HTMLAudioElement | null = null;
let coinsPickupAudio: HTMLAudioElement | null = null;
let introAudio: HTMLAudioElement | null = null;
let keyPickupAudio: HTMLAudioElement | null = null;
let monsterRoarAudio: HTMLAudioElement | null = null;
let mugPickupAudio: HTMLAudioElement | null = null;
let packagePickupAudio: HTMLAudioElement | null = null;
let phonePickupAudio: HTMLAudioElement | null = null;
let snoreAudio: HTMLAudioElement | null = null;
let vacuumPickupAudio: HTMLAudioElement | null = null;
let kettlePickupAudio: HTMLAudioElement | null = null;
let introShouldPlay = false;
let snoreShouldPlay = false;
let audioMuted = false;
let timeUpAudioPlayed = false;

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

function getAlarmClockPickupAudio(): HTMLAudioElement {
  if (!alarmClockPickupAudio) {
    alarmClockPickupAudio = new Audio(ALARM_CLOCK_PICKUP_SRC);
    alarmClockPickupAudio.preload = "auto";
  }
  return alarmClockPickupAudio;
}

function getBellPickupAudio(): HTMLAudioElement {
  if (!bellPickupAudio) {
    bellPickupAudio = new Audio(BELL_PICKUP_SRC);
    bellPickupAudio.preload = "auto";
  }
  return bellPickupAudio;
}

function getIntroAudio(): HTMLAudioElement {
  if (!introAudio) {
    introAudio = new Audio(INTRO_SONG_SRC);
    introAudio.preload = "auto";
    introAudio.addEventListener("ended", () => {
      if (!introShouldPlay || !introAudio) return;
      introAudio.currentTime = INTRO_START_TIME;
      void introAudio.play().catch(() => {});
    });
  }
  return introAudio;
}

function getCatPickupAudio(): HTMLAudioElement {
  if (!catPickupAudio) {
    catPickupAudio = new Audio(CAT_PICKUP_SRC);
    catPickupAudio.preload = "auto";
  }
  return catPickupAudio;
}

function getCoinsPickupAudio(): HTMLAudioElement {
  if (!coinsPickupAudio) {
    coinsPickupAudio = new Audio(COINS_PICKUP_SRC);
    coinsPickupAudio.preload = "auto";
  }
  return coinsPickupAudio;
}

function getKeyPickupAudio(): HTMLAudioElement {
  if (!keyPickupAudio) {
    keyPickupAudio = new Audio(KEY_PICKUP_SRC);
    keyPickupAudio.preload = "auto";
  }
  return keyPickupAudio;
}

function getMugPickupAudio(): HTMLAudioElement {
  if (!mugPickupAudio) {
    mugPickupAudio = new Audio(MUG_PICKUP_SRC);
    mugPickupAudio.preload = "auto";
  }
  return mugPickupAudio;
}

function getPackagePickupAudio(): HTMLAudioElement {
  if (!packagePickupAudio) {
    packagePickupAudio = new Audio(PACKAGE_PICKUP_SRC);
    packagePickupAudio.preload = "auto";
  }
  return packagePickupAudio;
}

function getPhonePickupAudio(): HTMLAudioElement {
  if (!phonePickupAudio) {
    phonePickupAudio = new Audio(PHONE_PICKUP_SRC);
    phonePickupAudio.preload = "auto";
  }
  return phonePickupAudio;
}

function getVacuumPickupAudio(): HTMLAudioElement {
  if (!vacuumPickupAudio) {
    vacuumPickupAudio = new Audio(VACUUM_PICKUP_SRC);
    vacuumPickupAudio.preload = "auto";
  }
  return vacuumPickupAudio;
}

function getKettlePickupAudio(): HTMLAudioElement {
  if (!kettlePickupAudio) {
    kettlePickupAudio = new Audio(KETTLE_PICKUP_SRC);
    kettlePickupAudio.preload = "auto";
  }
  return kettlePickupAudio;
}

function stopAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function getItemPickupAudios() {
  return [
    alarmClockPickupAudio,
    bellPickupAudio,
    catPickupAudio,
    coinsPickupAudio,
    keyPickupAudio,
    kettlePickupAudio,
    mugPickupAudio,
    packagePickupAudio,
    phonePickupAudio,
    vacuumPickupAudio,
  ];
}

export function playButtonClick() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getButtonClickAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playAlarmClockPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getAlarmClockPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playBellPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getBellPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playAlarmClockSound() {
  if (audioMuted) return;
  unlockAudioContext();

  const ring = () => {
    const audio = getBellPickupAudio();
    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {});
  };

  ring();
  window.setTimeout(ring, 420);
  window.setTimeout(ring, 840);
}

export function playCatPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getCatPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playCoinsPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getCoinsPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playKeyPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getKeyPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playMugPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getMugPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playPackagePickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getPackagePickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playPhonePickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getPhonePickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playVacuumPickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getVacuumPickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playKettlePickupSound() {
  if (audioMuted) return;
  unlockAudioContext();
  const audio = getKettlePickupAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function stopItemPickupSounds() {
  getItemPickupAudios().forEach(stopAudio);
}

export function playRejectSound() {
  if (audioMuted) return;
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
  if (audioMuted) return;
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
      if (
        !button ||
        button.classList.contains("draggable-item") ||
        button.classList.contains("mute-toggle")
      ) return;
      playButtonClick();
    },
    true,
  );
}

export function preloadGameAudio() {
  getAlarmClockPickupAudio().load();
  getBellPickupAudio().load();
  getCatPickupAudio().load();
  getCoinsPickupAudio().load();
  getIntroAudio().load();
  getKeyPickupAudio().load();
  getKettlePickupAudio().load();
  getMugPickupAudio().load();
  getPackagePickupAudio().load();
  getPhonePickupAudio().load();
  getVacuumPickupAudio().load();
  getSnoreAudio().load();
  getMonsterRoarAudio().load();
}

export function stopGameAudio() {
  introShouldPlay = false;
  snoreShouldPlay = false;
  stopIntroMusic();
  stopSnore();
}

export function playIntroMusic() {
  if (audioMuted) return;
  unlockAudioContext();
  introShouldPlay = true;

  const audio = getIntroAudio();
  audio.loop = false;

  const play = () => {
    if (!introShouldPlay || !audio.paused) return;
    audio.currentTime = INTRO_START_TIME;
    void audio.play().catch(() => {});
  };

  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
    play();
    return;
  }

  audio.addEventListener("loadedmetadata", play, { once: true });
  if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
    audio.load();
  }
}

export function stopIntroMusic() {
  introShouldPlay = false;
  if (!introAudio) return;
  introAudio.pause();
  introAudio.currentTime = INTRO_START_TIME;
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
  if (audioMuted) return;
  stopIntroMusic();
  unlockAudioContext();
  snoreShouldPlay = true;

  const audio = getSnoreAudio();
  const play = () => {
    if (!snoreShouldPlay || !audio.paused) return;
    void audio.play().catch(() => {
      snoreShouldPlay = false;
    });
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
  if (audioMuted) return;
  unlockAudioContext();
  snoreShouldPlay = false;
  stopSnore();

  const audio = getMonsterRoarAudio();
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function playClockAlarm() {
  playAlarmClockSound();
}

export function playTimeUpAudio() {
  if (audioMuted || timeUpAudioPlayed) return;
  timeUpAudioPlayed = true;
  playClockAlarm();
  window.setTimeout(() => {
    playWakeSting();
  }, 700);
}

export function resumeGameplayAudio(stage: MonsterStage = "deepSleep") {
  if (audioMuted) return;
  stopIntroMusic();
  startSnore();
  updateSnoreForStage(stage);
}

export function syncGameAudio(
  status: GameStatus,
  stage: MonsterStage,
  loseReason: LoseReason | null = null,
) {
  if (audioMuted) {
    introShouldPlay = false;
    snoreShouldPlay = false;
    stopIntroMusic();
    stopSnore();
    return;
  }

  if (stage === "awake") {
    stopIntroMusic();
    if (loseReason === "time") {
      playTimeUpAudio();
    } else {
      playWakeSting();
    }
    return;
  }

  if (status === "idle") {
    snoreShouldPlay = false;
    stopSnore();
    playIntroMusic();
    return;
  }

  if (status === "playing") {
    timeUpAudioPlayed = false;
    stopIntroMusic();
    startSnore();
    updateSnoreForStage(stage);
  }
}

export function setAudioMuted(muted: boolean) {
  audioMuted = muted;

  [alarmClockPickupAudio, bellPickupAudio, buttonClickAudio, catPickupAudio, coinsPickupAudio, introAudio, keyPickupAudio, kettlePickupAudio, monsterRoarAudio, mugPickupAudio, packagePickupAudio, phonePickupAudio, snoreAudio, vacuumPickupAudio].forEach((audio) => {
    if (!audio) return;
    audio.muted = muted;
    if (muted) audio.pause();
  });

  if (muted) {
    introShouldPlay = false;
    snoreShouldPlay = false;
    stopItemPickupSounds();
    stopIntroMusic();
    stopSnore();
  }
}

export function isAudioMuted() {
  return audioMuted;
}
