import { useEffect, useRef } from "react";
import type { MonsterStage } from "../types/game";

const SLEEPING_MP4 = "/creature/sleeping.mp4";
const OPENS_EYES_MP4 = "/creature/opens-eyes.mp4";
const SITUP_MP4 = "/creature/waking-up.mp4";

const SITUP_CROP = {
  x: 0 / 1468,
  y: 0 / 1408,
  width: 1468 / 1468,
  height: 1408 / 1408,
} as const;

const SLEEP_CREATURE_HEIGHT_RATIO = 881 / 1160;

const CREATURE_SPRITE_HEIGHT_SCALE =
  SLEEP_CREATURE_HEIGHT_RATIO * (1408 / 727);

const SLEEP_LAYOUT = {
  bottomRatio: 1,
  centerXRatio: 0.4997,
} as const;

const SITUP_LAYOUT = {
  bottomRatio: 1362 / 1408,
  centerXRatio: 0.4602,
} as const;

const OPENS_EYES_HOLD_TIME = 3.2;

interface CreatureProps {
  stage: MonsterStage;
  snorePhase: number;
}

function showSleepVideo(stage: MonsterStage): boolean {
  return stage === "deepSleep";
}

function showBarelyAwakeVideo(stage: MonsterStage): boolean {
  return stage === "stirring" || stage === "suspicious";
}

function showSitUpVideo(stage: MonsterStage): boolean {
  return stage === "awake";
}

function getBarelyAwakePlaybackRate(stage: MonsterStage): number {
  switch (stage) {
    case "stirring":
      return 0.4;
    case "suspicious":
      return 0.55;
    default:
      return 1;
  }
}

function drawAlignedVideo(
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  layout: { bottomRatio: number; centerXRatio: number },
  crop?: { x: number; y: number; width: number; height: number },
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const sx = crop ? crop.x * vw : 0;
  const sy = crop ? crop.y * vh : 0;
  const sw = crop ? crop.width * vw : vw;
  const sh = crop ? crop.height * vh : vh;

  const destW = canvasW;
  const destH = destW * (sh / sw);
  const destY = canvasH - destH * layout.bottomRatio;
  const destX = (SLEEP_LAYOUT.centerXRatio - layout.centerXRatio) * destW;

  ctx.drawImage(video, sx, sy, sw, sh, destX, destY, destW, destH);

  return { destX, destY, destW, destH };
}

function keyOutSleepPixel(data: Uint8ClampedArray, index: number) {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;

  if (luma < 24) {
    data[index + 3] = 0;
    return;
  }

  if (luma < 42) {
    const fade = (luma - 24) / 18;
    data[index + 3] = Math.min(data[index + 3], Math.round(fade * 255));
  }
}

function isWakeBackgroundPixel(r: number, g: number, b: number) {
  const maxC = Math.max(r, g, b);
  const spread = maxC - Math.min(r, g, b);
  return maxC <= 24 && spread <= 10;
}

function keyOutSitUpFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const pixelCount = width * height;
  const isBackground = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (pixelIndex: number) => {
    if (isBackground[pixelIndex]) return;
    const dataIndex = pixelIndex * 4;
    if (
      !isWakeBackgroundPixel(
        data[dataIndex],
        data[dataIndex + 1],
        data[dataIndex + 2],
      )
    ) {
      return;
    }
    isBackground[pixelIndex] = 1;
    queue[tail++] = pixelIndex;
  };

  for (let x = 0; x < width; x += 1) {
    tryEnqueue(x);
    tryEnqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    tryEnqueue(y * width);
    tryEnqueue(y * width + (width - 1));
  }

  while (head < tail) {
    const pixelIndex = queue[head++];
    const x = pixelIndex % width;
    const y = (pixelIndex / width) | 0;

    if (x > 0) tryEnqueue(pixelIndex - 1);
    if (x < width - 1) tryEnqueue(pixelIndex + 1);
    if (y > 0) tryEnqueue(pixelIndex - width);
    if (y < height - 1) tryEnqueue(pixelIndex + width);
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4;
    if (isBackground[pixelIndex]) {
      data[dataIndex + 3] = 0;
      continue;
    }

    const r = data[dataIndex];
    const g = data[dataIndex + 1];
    const b = data[dataIndex + 2];
    const maxC = Math.max(r, g, b);
    const spread = maxC - Math.min(r, g, b);

    if (maxC > 24 || spread > 10) {
      data[dataIndex + 3] = 255;
      continue;
    }

    let touchesBackground = false;
    const x = pixelIndex % width;
    const y = (pixelIndex / width) | 0;
    if (x > 0 && isBackground[pixelIndex - 1]) touchesBackground = true;
    else if (x < width - 1 && isBackground[pixelIndex + 1]) touchesBackground = true;
    else if (y > 0 && isBackground[pixelIndex - width]) touchesBackground = true;
    else if (y < height - 1 && isBackground[pixelIndex + width]) touchesBackground = true;

    if (touchesBackground) {
      const fade = maxC / 24;
      data[dataIndex + 3] = Math.round(Math.min(1, Math.max(0.35, fade)) * 255);
    } else {
      data[dataIndex + 3] = 255;
    }
  }
}

function applySleepKeyToCanvas(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
) {
  const imageData = ctx.getImageData(0, 0, canvasW, canvasH);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    keyOutSleepPixel(data, i);
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawSleepStyleFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  lastSize: { width: number; height: number },
) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0 || video.readyState < 2) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bufferWidth = Math.round(width * dpr);
  const bufferHeight = Math.round(height * dpr);

  if (bufferWidth !== lastSize.width || bufferHeight !== lastSize.height) {
    lastSize.width = bufferWidth;
    lastSize.height = bufferHeight;
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAlignedVideo(video, ctx, canvas.width, canvas.height, SLEEP_LAYOUT);
  applySleepKeyToCanvas(ctx, canvas.width, canvas.height);
}

function drawSitUpFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  lastSize: { width: number; height: number },
) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0 || video.readyState < 2) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bufferWidth = Math.round(width * dpr);
  const bufferHeight = Math.round(height * dpr);

  if (bufferWidth !== lastSize.width || bufferHeight !== lastSize.height) {
    lastSize.width = bufferWidth;
    lastSize.height = bufferHeight;
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { destX, destY, destW, destH } = drawAlignedVideo(
    video,
    ctx,
    canvas.width,
    canvas.height,
    SITUP_LAYOUT,
    SITUP_CROP,
  );

  const keyX = Math.max(0, Math.floor(destX));
  const keyY = Math.max(0, Math.floor(destY));
  const keyW = Math.min(canvas.width - keyX, Math.ceil(destW));
  const keyH = Math.min(canvas.height - keyY, Math.ceil(destH));
  const imageData = ctx.getImageData(keyX, keyY, keyW, keyH);
  keyOutSitUpFrame(imageData.data, keyW, keyH);
  ctx.putImageData(imageData, keyX, keyY);
}

function ensureVideoPlaying(video: HTMLVideoElement) {
  if (!video.paused || video.readyState < 2) return;
  void video.play().catch(() => {});
}

export function Creature({ stage, snorePhase }: CreatureProps) {
  const sleepVideoRef = useRef<HTMLVideoElement>(null);
  const barelyAwakeVideoRef = useRef<HTMLVideoElement>(null);
  const sitUpVideoRef = useRef<HTMLVideoElement>(null);
  const sleepCanvasRef = useRef<HTMLCanvasElement>(null);
  const barelyAwakeCanvasRef = useRef<HTMLCanvasElement>(null);
  const sitUpCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevStageRef = useRef<MonsterStage>(stage);
  const stageRef = useRef<MonsterStage>(stage);
  stageRef.current = stage;

  const breathScale = 1 + Math.sin(snorePhase) * 0.04;
  const sleepVisible = showSleepVideo(stage);
  const barelyAwakeVisible = showBarelyAwakeVideo(stage);
  const sitUpVisible = showSitUpVideo(stage);

  useEffect(() => {
    const barelyVideo = barelyAwakeVideoRef.current;
    const sitUpVideo = sitUpVideoRef.current;
    if (!barelyVideo || !sitUpVideo) return;

    const primeVideo = (video: HTMLVideoElement) => {
      video.currentTime = 0;
      video.pause();
    };

    const onBarelyReady = () => primeVideo(barelyVideo);
    const onSitUpReady = () => primeVideo(sitUpVideo);

    barelyVideo.addEventListener("loadeddata", onBarelyReady);
    sitUpVideo.addEventListener("loadeddata", onSitUpReady);
    if (barelyVideo.readyState >= 2) onBarelyReady();
    if (sitUpVideo.readyState >= 2) onSitUpReady();

    return () => {
      barelyVideo.removeEventListener("loadeddata", onBarelyReady);
      sitUpVideo.removeEventListener("loadeddata", onSitUpReady);
    };
  }, []);

  useEffect(() => {
    const sleepVideo = sleepVideoRef.current;
    const barelyVideo = barelyAwakeVideoRef.current;
    const sitUpVideo = sitUpVideoRef.current;
    if (!sleepVideo || !barelyVideo || !sitUpVideo) return;

    const prevStage = prevStageRef.current;

    if (stage === "deepSleep") {
      sleepVideo.loop = true;
      sleepVideo.playbackRate = 1;
      barelyVideo.pause();
      barelyVideo.loop = false;
      barelyVideo.currentTime = 0;
      sitUpVideo.pause();
      sitUpVideo.loop = false;
      sitUpVideo.currentTime = 0;
      void sleepVideo.play().catch(() => {});
      prevStageRef.current = stage;
      return;
    }

    sleepVideo.pause();

    if (showBarelyAwakeVideo(stage)) {
      sitUpVideo.pause();
      sitUpVideo.currentTime = 0;

      if (stage === "stirring" && (prevStage === "deepSleep" || prevStage === "suspicious")) {
        barelyVideo.currentTime = 0;
      }

      barelyVideo.loop = stage === "stirring";
      barelyVideo.playbackRate = getBarelyAwakePlaybackRate(stage);
      void barelyVideo.play().catch(() => {});
    }

    if (showSitUpVideo(stage)) {
      barelyVideo.pause();

      if (prevStage !== "awake") {
        sitUpVideo.currentTime = 0;
      }

      sitUpVideo.loop = false;
      sitUpVideo.playbackRate = 1;
      void sitUpVideo.play().catch(() => {});
    }

    prevStageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const barelyVideo = barelyAwakeVideoRef.current;
    if (!barelyVideo || stage !== "suspicious") return;

    const onTimeUpdate = () => {
      if (barelyVideo.currentTime >= OPENS_EYES_HOLD_TIME) {
        barelyVideo.pause();
        barelyVideo.currentTime = OPENS_EYES_HOLD_TIME;
      }
    };

    barelyVideo.addEventListener("timeupdate", onTimeUpdate);
    return () => barelyVideo.removeEventListener("timeupdate", onTimeUpdate);
  }, [stage]);

  useEffect(() => {
    const sleepVideo = sleepVideoRef.current;
    const barelyVideo = barelyAwakeVideoRef.current;
    const sitUpVideo = sitUpVideoRef.current;
    const sleepCanvas = sleepCanvasRef.current;
    const barelyCanvas = barelyAwakeCanvasRef.current;
    const sitUpCanvas = sitUpCanvasRef.current;
    if (
      !sleepVideo ||
      !barelyVideo ||
      !sitUpVideo ||
      !sleepCanvas ||
      !barelyCanvas ||
      !sitUpCanvas
    ) {
      return;
    }

    const sleepCtx = sleepCanvas.getContext("2d", { willReadFrequently: true });
    const barelyCtx = barelyCanvas.getContext("2d", { willReadFrequently: true });
    const sitUpCtx = sitUpCanvas.getContext("2d", { willReadFrequently: true });
    if (!sleepCtx || !barelyCtx || !sitUpCtx) return;

    let frameId = 0;
    const sleepSize = { width: 0, height: 0 };
    const barelySize = { width: 0, height: 0 };
    const sitUpSize = { width: 0, height: 0 };

    const drawFrame = () => {
      if (sleepVideo.readyState >= 2) {
        if (sleepVisible) ensureVideoPlaying(sleepVideo);
        drawSleepStyleFrame(sleepVideo, sleepCanvas, sleepCtx, sleepSize);
      }

      if (barelyVideo.readyState >= 2) {
        if (barelyAwakeVisible) ensureVideoPlaying(barelyVideo);
        drawSleepStyleFrame(barelyVideo, barelyCanvas, barelyCtx, barelySize);
      }

      if (sitUpVideo.readyState >= 2) {
        if (sitUpVisible) ensureVideoPlaying(sitUpVideo);
        drawSitUpFrame(sitUpVideo, sitUpCanvas, sitUpCtx, sitUpSize);
      }

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="creature-wrapper">
      <div className="sofa">
        <div
          className={`creature creature--${stage}`}
          style={{ transform: `scale(${breathScale})` }}
        >
          <div
            className="creature-sprite"
            style={{ aspectRatio: `1784 / ${1160 * CREATURE_SPRITE_HEIGHT_SCALE}` }}
            aria-hidden
          >
            <video
              ref={sleepVideoRef}
              className="creature-video-source"
              src={SLEEPING_MP4}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={barelyAwakeVideoRef}
              className="creature-video-source"
              src={OPENS_EYES_MP4}
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={sitUpVideoRef}
              className="creature-video-source"
              src={SITUP_MP4}
              muted
              playsInline
              preload="auto"
            />
            <canvas
              ref={sleepCanvasRef}
              className={`creature-video creature-video--sleep${!sleepVisible ? " creature-video--inactive" : ""}`}
            />
            <canvas
              ref={barelyAwakeCanvasRef}
              className={`creature-video creature-video--barely${!barelyAwakeVisible ? " creature-video--inactive" : ""}`}
            />
            <canvas
              ref={sitUpCanvasRef}
              className={`creature-video creature-video--situp${!sitUpVisible ? " creature-video--inactive" : ""}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
