# Keep It Quiet

A high-tension, stealth-based puzzle game where you sort scattered household items without waking the sleeping creature on the sofa.

## About

Every drag generates noise. Move too fast, get too close to the sofa, or handle jingly items carelessly — and the noise meter fills. Wake the creature, and you lose.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/vaidaburbe-design/AI-hackathon-game.git
cd AI-hackathon-game
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

The project uses Vite. Vercel auto-detects the framework from `package.json`.

- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` sets `frame-ancestors *` for iframe embedding

## How to Play

1. Click **Start Round 1**
2. Drag items into the **Sort Box** at the bottom
3. Move slowly — especially near the sofa
4. Wait quietly and the creature settles back down
5. Complete all 3 rounds to win

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Web Audio API (procedural snore + wake sting)

## Project Structure

```
src/
├── components/     # UI (Creature, LivingRoom, DraggableItem, etc.)
├── config/         # Game tuning constants
├── data/           # Items and round definitions
├── systems/        # Noise and monster logic (pure functions)
├── state/          # GameContext + reducer
├── hooks/          # Game loop, drag noise
├── audio/          # Web Audio manager
└── embed/          # Iframe audio-unlock utilities
```

## Authors

- Vaida & Ina — AI Hackathon Game
