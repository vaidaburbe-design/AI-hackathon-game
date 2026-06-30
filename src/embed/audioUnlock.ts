const AUDIO_UNLOCK_EVENTS = ["click", "touchstart", "keydown"];

function muteMediaElement(element: HTMLMediaElement) {
  element.muted = true;
  element.setAttribute("data-audio-locked", "true");
}

function unlockAudio() {
  document
    .querySelectorAll<HTMLMediaElement>("audio[data-audio-locked], video[data-audio-locked]")
    .forEach((element) => {
      element.muted = false;
      element.removeAttribute("data-audio-locked");
    });
}

function observeMediaElements() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("audio, video")) muteMediaElement(node as HTMLMediaElement);
        node.querySelectorAll("audio, video").forEach((el) =>
          muteMediaElement(el as HTMLMediaElement),
        );
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function initAudioUnlock() {
  document.querySelectorAll("audio, video").forEach((el) =>
    muteMediaElement(el as HTMLMediaElement),
  );
  observeMediaElements();

  const unlockOnce = () => {
    unlockAudio();
    AUDIO_UNLOCK_EVENTS.forEach((eventName) => {
      document.removeEventListener(eventName, unlockOnce);
    });
  };

  AUDIO_UNLOCK_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, unlockOnce, { passive: true });
  });
}

export function setEmbedCookie(name: string, value: string, options: { maxAge?: number } = {}) {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=None",
    "Secure",
  ];
  if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
  document.cookie = parts.join("; ");
}
