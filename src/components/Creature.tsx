import { useEffect, useRef } from "react";
import type { MonsterStage } from "../types/game";

const SLEEPING_MP4 = "/creature/sleeping.mp4";
const WAKING_MP4 = "/creature/waking-up.mp4";

interface CreatureProps {
  stage: MonsterStage;
  snorePhase: number;
}

function showSleepVideo(stage: MonsterStage): boolean {
  return stage === "deepSleep";
}

function getSleepPlaybackRate(stage: MonsterStage): number {
  switch (stage) {
    case "stirring":
      return 1.2;
    case "suspicious":
      return 0.95;
    default:
      return 1;
  }
}

function getWakePlaybackRate(stage: MonsterStage): number {
  switch (stage) {
    case "stirring":
      return 0.65;
    case "suspicious":
      return 0.85;
    case "awake":
      return 1;
    default:
      return 1;
  }
}

function keyOutPixel(data: Uint8ClampedArray, index: number) {
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

function drawVideoFrame(
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
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    keyOutPixel(data, i);
  }

  ctx.putImageData(imageData, 0, 0);
}

export function Creature({ stage, snorePhase }: CreatureProps) {
  const sleepVideoRef = useRef<HTMLVideoElement>(null);
  const wakeVideoRef = useRef<HTMLVideoElement>(null);
  const sleepCanvasRef = useRef<HTMLCanvasElement>(null);
  const wakeCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevStageRef = useRef<MonsterStage>(stage);

  const breathScale = 1 + Math.sin(snorePhase) * 0.04;
  const sleepVisible = showSleepVideo(stage);
  const wakeVisible = !sleepVisible;

  useEffect(() => {
    const sleepVideo = sleepVideoRef.current;
    const wakeVideo = wakeVideoRef.current;
    if (!sleepVideo || !wakeVideo) return;

    const prevStage = prevStageRef.current;

    if (stage === "deepSleep") {
      sleepVideo.loop = true;
      sleepVideo.playbackRate = 1;
      wakeVideo.pause();
      wakeVideo.loop = false;
      wakeVideo.currentTime = 0;
      void sleepVideo.play().catch(() => {});
      prevStageRef.current = stage;
      return;
    }

    sleepVideo.playbackRate = getSleepPlaybackRate(stage);
    void sleepVideo.play().catch(() => {});

    if (prevStage === "deepSleep") {
      wakeVideo.currentTime = 0;
    }

    wakeVideo.loop = stage !== "awake";
    wakeVideo.playbackRate = getWakePlaybackRate(stage);
    void wakeVideo.play().catch(() => {});

    if (stage === "awake") {
      sleepVideo.pause();
    }

    prevStageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const sleepVideo = sleepVideoRef.current;
    const wakeVideo = wakeVideoRef.current;
    const sleepCanvas = sleepCanvasRef.current;
    const wakeCanvas = wakeCanvasRef.current;
    if (!sleepVideo || !wakeVideo || !sleepCanvas || !wakeCanvas) return;

    const sleepCtx = sleepCanvas.getContext("2d", { willReadFrequently: true });
    const wakeCtx = wakeCanvas.getContext("2d", { willReadFrequently: true });
    if (!sleepCtx || !wakeCtx) return;

    let frameId = 0;
    const sleepSize = { width: 0, height: 0 };
    const wakeSize = { width: 0, height: 0 };

    const drawFrame = () => {
      if (sleepVisible) {
        drawVideoFrame(sleepVideo, sleepCanvas, sleepCtx, sleepSize);
      } else {
        sleepCtx.clearRect(0, 0, sleepCanvas.width, sleepCanvas.height);
      }

      if (wakeVisible) {
        drawVideoFrame(wakeVideo, wakeCanvas, wakeCtx, wakeSize);
      } else {
        wakeCtx.clearRect(0, 0, wakeCanvas.width, wakeCanvas.height);
      }

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => cancelAnimationFrame(frameId);
  }, [sleepVisible, wakeVisible]);

  return (
    <div className="creature-wrapper">
      <div className="sofa">
        <div
          className={`creature creature--${stage}`}
          style={{ transform: `scale(${breathScale})` }}
        >
          <div className="creature-sprite" aria-hidden>
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
              ref={wakeVideoRef}
              className="creature-video-source"
              src={WAKING_MP4}
              muted
              playsInline
              preload="auto"
            />
            <canvas
              ref={sleepCanvasRef}
              className="creature-video creature-video--sleep"
              hidden={!sleepVisible}
            />
            <canvas
              ref={wakeCanvasRef}
              className="creature-video creature-video--wake"
              hidden={!wakeVisible}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
