# shpoker

Small mobile-first web app for tracking a home poker game with friends: log
buy-ins per player through the night, then settle up at the end — either by
entering each player's final cash amount or their chip counts.

## Stack

- **Vite + React + TypeScript**
- **Zustand** (with `persist`) for state — everything lives in `localStorage`, no backend
- **Tailwind CSS v4** + a small hand-rolled design-system layer (`src/index.css`) — no component library
- **Vitest** for unit tests
- **Biome** for formatting + import sorting, **oxlint** for linting
- **Husky** + **commitlint** for pre-commit checks and Conventional Commits

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the Vitest suite once |
| `npm run lint` | Run oxlint |
| `npm run format` | Run Biome (formats + sorts imports) |

## How the app is organized

- **`src/pages/`** — the three screens: `Home` (create/open/delete games),
  `GamePage` (add players, log buy-ins), `SettleUp` (enter final stacks, see
  who owes who).
- **`src/store/gameStore.ts`** — the single Zustand store. All game state
  (players, buy-ins, settle entries) lives here, persisted to `localStorage`.
  `findGame(games, gameId)` is the shared lookup helper used everywhere a
  component needs a specific game.
- **`src/lib/settlement.ts`** — the settle-up math: `computeNet` turns buy-ins
  and final stacks into a per-player net (up/down), `computeTransfers` turns
  that into an actual list of who-pays-whom. It's a two-pass algorithm: first
  it pairs off players whose amounts match exactly (one transfer each), then
  greedily clears whatever's left. See `settlement.test.ts` for the cases
  this is meant to handle.
- **`src/lib/chips.ts`** — the four physical chip denominations (black/blue/
  green/red) and their euro values, used by the "enter chip counts" mode on
  the settle screen.
- **`src/components/ui/`** — small local wrappers around
  [Base UI](https://base-ui.com) primitives (currently just the alert
  dialog used for delete/remove confirmations). Not a full component library
  — styling comes from the `.card` / `.btn` / `.input` / etc. classes in
  `index.css`, not Tailwind utility classes or a theme system.

## Data model notes

- A **buy-in** is an immutable log entry (`{ playerId, amount, createdAt }`) —
  removing one deletes the entry rather than adjusting a running total, so the
  buy-in log is always an accurate history.
- A **settle entry** is a discriminated union per player:
  `{ mode: 'amount', amount }` or `{ mode: 'chips', chips }`. Whichever mode
  is active gets converted to a euro amount before the settlement math runs.
- Games are capped at the **10 most recently created**; older ones are
  dropped automatically when a new one is created.

## Before committing

Husky runs `lint-staged` (Biome + oxlint), a full `tsc -b` typecheck, and the
Vitest suite on every commit; commitlint enforces Conventional Commits on the
message.
