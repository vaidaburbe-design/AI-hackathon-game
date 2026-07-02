import { ITEM_CATALOG } from "../data/items";

const FIRST_ROUND_ITEM_IMAGES = Object.values(ITEM_CATALOG)
  .filter((item) => item.noiseLevel <= 3)
  .map((item) => item.image)
  .filter((image): image is string => Boolean(image));

const CRITICAL_IMAGE_SOURCES = [
  "/living-room.jpg",
  "/items/sort-box.png",
  ...FIRST_ROUND_ITEM_IMAGES,
];

const BACKGROUND_IMAGE_SOURCES = [
  "/intro-bg.png",
  ...Object.values(ITEM_CATALOG)
    .map((item) => item.image)
    .filter((image): image is string => Boolean(image)),
  "/items/sort-success-check.png",
  "/items/sort-reject-x.png",
  "/items/sort-hint-arrow.png",
  "/creature/happy-win.png",
  "/creature/sad-lose.png",
  "/creature/time-up.png",
  "/creature/round-win-check.png",
];

const CRITICAL_VIDEO_SOURCES = ["/creature/sleeping_new.mp4"];

const BACKGROUND_VIDEO_SOURCES = [
  "/creature/opens-eyes_new.mp4",
  "/creature/waking-up_new.mp4",
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
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => resolve();
    video.oncanplay = () => resolve();
    video.onerror = () => resolve();
    video.src = src;
    video.load();
  });
}

function preloadAll(images: string[], videos: string[]) {
  const uniqueImages = [...new Set(images)];
  const uniqueVideos = [...new Set(videos)];

  return Promise.all([
    ...uniqueImages.map(preloadImage),
    ...uniqueVideos.map(preloadVideo),
  ]).then(() => undefined);
}

export function preloadGameAssets() {
  const criticalPreload = preloadAll(CRITICAL_IMAGE_SOURCES, CRITICAL_VIDEO_SOURCES);

  void criticalPreload.then(() => {
    void preloadAll(BACKGROUND_IMAGE_SOURCES, BACKGROUND_VIDEO_SOURCES);
  });

  return criticalPreload;
}
