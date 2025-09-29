
# Quick Count — Phaser 3 + TypeScript + Vite

QuickCount is a math-quiz game built with Phaser 3 and TypeScript. This repository contains a playable 60s classic mode plus a seeded daily challenge, adaptive difficulty, and small power-up mechanics.

## Development commands
- Install dependencies: `npm install`
- Start development server (Vite): `npm start` or `npm run start`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`

## Quick features
- 60s Classic mode
- Adaptive difficulty (operand ranges and timing adjust with player streak)
- Power-ups: Freeze (pauses timer briefly), 50/50 (removes wrong answers), Slow (slow-motion for a short period)
- SFX are procedural tones (no external SFX assets). SFX toggle saved in user settings.
- Daily Challenge seeded by date with separate best-score tracking

## Architecture overview

This is a scene-based Phaser 3 project with a small set of shared systems that encapsulate game logic and persistence.

Scene flow: Boot → Preload → Menu → Game (+ UI overlay) → Results

Key systems and responsibilities:
- `Save` (`src/systems/Save.ts`) — central persistence layer. Use `Save.get()` and `Save.set()` for all storage; these methods are async and the authoritative `SaveData` interface lives here.
- `DifficultyManager` (`src/systems/DifficultyManager.ts`) — adjusts operand ranges and operation weights based on player performance/streak.
- `QuestionGenerator` (`src/systems/QuestionGenerator.ts`) — builds math questions according to difficulty rules and configured operation weights.
- `PowerupManager` (`src/systems/PowerupManager.ts`) — manages power-up state and effects (Freeze, 50/50, Slow) during a game session.
- `Sound` (`src/systems/Sound.ts`) — procedural SFX generator; controlled by the SFX setting from `Save`.
- `Daily` (`src/systems/Daily.ts`) — generates a deterministic seed for daily challenges (seeded by IST date YYYYMMDD).

## Important notes for contributors
- All scene `create()` lifecycle methods are treated as async when they interact with the `Save` system — load settings or player data before proceeding to avoid race conditions.
- The `SaveData` interface in `src/systems/Save.ts` is the authoritative type for persisted game state. Update it when adding new saved fields and migrate safely.
- PlayGama SDK integration is available and controlled by flags in `src/data/gameConfigs.ts` (`IS_BUILD`, `IS_PLAYGAMA`). The project falls back to `localStorage` when PlayGama is not enabled.
- Game is designed for 720×1280 resolution with FIT scaling in the Phaser config (`src/main.ts`).

## Project layout (important files)
- `src/main.ts` — Phaser game configuration and scene registration
- `src/data/gameConfigs.ts` — feature flags and game configuration constants
- `src/data/types.ts` — shared TS interfaces used across scenes and systems
- `src/scenes/*` — Phaser scenes (`BootScene`, `PreloadScene`, `MenuScene`, `GameScene`, `UIScene`, `ResultsScene`, `ShopScene`)
- `src/systems/*` — core managers and utilities (`Save.ts`, `DifficultyManager.ts`, `QuestionGenerator.ts`, `PowerupManager.ts`, `Daily.ts`, `RNG.ts`, `Economy.ts`, `Sound.ts`, etc.)
- `public/library/playgama` — PlayGama bridge files (optional integration)
- `assets/` — images, audio, fonts, and atlas data used by the game

## How to run locally
1. Install dependencies: `npm install`
2. Start dev server: `npm start` (opens Vite dev server)
3. Open the URL printed by Vite (usually `http://localhost:5173`) and play.

## Tests / Validation
This project does not include a formal test suite. Before pushing changes, verify that:
- TypeScript compiles cleanly: `npm run build` (this runs the TypeScript build + Vite)
- The dev server runs without errors: `npm start`

## Notes / TODOs
- Consider adding a small unit test around `QuestionGenerator` and `DifficultyManager` to validate adaptive rules.
- Add migration helpers if `SaveData` shape changes across releases.

## Creator
- Made with ❤️ by [Ravi Kapuriya](https://github.com/ravikapuriya)
