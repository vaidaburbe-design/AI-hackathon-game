import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initButtonClickSound } from "./audio/audioManager";
import { initAudioUnlock } from "./embed/audioUnlock";
import App from "./App";
import "./index.css";

initAudioUnlock();
initButtonClickSound();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
