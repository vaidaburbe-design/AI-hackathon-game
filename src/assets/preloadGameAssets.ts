import { ITEM_CATALOG } from "../data/items";

const IMAGE_SOURCES = [
  "/living-room.jpg",
  "/intro-bg.png",
  "/items/sort-box.png",
  "/creature/happy-win.png",
  "/creature/sad-lose.png",
  "/creature/time-up.png",
  "/creature/round-win-check.png",
  ...Object.values(ITEM_CATALOG)
    .map((item) => item.image)
    .filter((image): image is string => Boolean(image)),
];

const VIDEO_SOURCES = [
  "/creature/sleeping.mp4",
  "/creature/opens-eyes.mp4",
  "/creature/waking-up.mp4",
];

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function preloadVideo(src: string) {
  return new Promise<void>((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.oncanplaythrough = () => resolve();
    video.onerror = () => resolve();
    video.src = src;
    video.load();
  });
}

export function preloadGameAssets() {
  return Promise.all([
    ...IMAGE_SOURCES.map(preloadImage),
    ...VIDEO_SOURCES.map(preloadVideo),
  ]).then(() => undefined);
}
