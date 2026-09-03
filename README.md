# QuizRush

A real-time, team-based Kahoot-style quiz platform built for a single live
event. One Nuxt 3 app, one SQLite file, WebSockets for everything real-time.

## Run it tonight

```bash
npm install
cp .env.example .env   # then edit GAME_MASTER_USERNAME / GAME_MASTER_PASSWORD
npm run dev
```

Open `http://localhost:3000/master/login` to sign in as the Game Master, or
just `http://localhost:3000` for the player join screen.

For the real event, players join on their phones, so run this on a machine
reachable from the venue's Wi-Fi and share that machine's LAN IP (e.g.
`http://192.168.1.23:3000`) instead of `localhost`. The Game Master lobby
screen shows a QR code and copyable join link once a game is launched.

### Production build

```bash
npm run build
node .output/server/index.mjs
```

The server reads `PORT` (default `3000`) and `HOST` (default listens on all
interfaces) like any Nitro `node-server` build.

## Environment variables

There is exactly one Game Master account, configured via environment
variables (never hardcoded, never sent to the client):

| Variable               | Required | Description                                |
| ----------------------- | -------- | -------------------------------------------- |
| `GAME_MASTER_USERNAME`  | no (defaults to `admin`) | Game Master login username |
| `GAME_MASTER_PASSWORD`  | **yes**  | Game Master login password |
| `DB_PATH`               | no       | SQLite file path (defaults to `./data/game.db`) |

Copy `.env.example` to `.env` and fill these in. `.env` is git-ignored.

## How it's built

- **Nuxt 4 / Vue 3 / TypeScript / Tailwind** for the whole app — no separate
  backend project.
- **Nitro server routes** (`server/api/**`) for all REST endpoints (auth,
  game/question/team CRUD, join flow).
- **A single WebSocket endpoint** (`server/routes/ws.ts`, via Nitro's
  `defineWebSocketHandler`) drives all real-time gameplay: lobby presence,
  question start/end, team answering, live scoring, leaderboards.
- **SQLite via `better-sqlite3`** (`server/utils/db.ts`) persists games,
  questions, teams, players and answers, so a server restart or a browser
  refresh doesn't lose the event. All writes are synchronous, so there's no
  race condition between concurrent WebSocket messages in the single Node
  process.
- **`server/utils/gameEngine.ts`** is the single authoritative state machine
  for game progress, question timers, team locking, and score awarding — the
  client only ever displays what the server sends it. Scoring itself lives in
  one place, `server/utils/scoring.ts`.
- **Pinia** (`app/stores/`) holds client-side live-game state
  (`liveGame.ts`, fed entirely by WebSocket messages) separate from
  Game-Master-only UI state (`master.ts`).

### Team answering model

A team is one scoring unit, but every member can answer from their own
phone. The server tracks each submission; the moment any teammate submits a
*correct* answer, that team is locked for the question, everyone on the team
is notified immediately, and the score is awarded once. Incorrect answers
don't lock the team — teammates (including the same player) can keep trying
until time runs out or someone gets it.

### Scoring

Kahoot-style: correct answers earn 30–100% of the question's base points
depending on how much time was left when the team answered
(`server/utils/scoring.ts:speedScore`). Slider and Pin Answer questions
additionally scale by how close the answer was to the correct value. Wrong
answers score zero; scores never go negative.

## Question types

All six ship: Quiz (2–4 choices), True/False, Type Answer (forgiving
matching — trims, lowercases, collapses whitespace), Slider (proximity
scoring), Pin Answer (tap-the-image, distance-based scoring), and Puzzle
(drag/arrow reordering, exact-order matching).

## Routes

- `/` , `/join`, `/join/[pin]`, `/join/[pin]/team/[team]` — player join flow
- `/game/[pin]` — the player's entire in-game experience (lobby → question →
  results → leaderboard → final results), driven by one WebSocket connection
- `/master/login`, `/master` — Game Master auth + dashboard
- `/master/games/new`, `/master/games/[id]` — game/question editor
- `/master/games/[id]/lobby`, `/master/games/[id]/play`,
  `/master/games/[id]/results` — live lobby, in-game control panel, and
  final results, meant for a laptop or a TV/projector

(The player-facing results/leaderboard views were folded into the single
`/game/[pin]` page rather than separate routes, since it's all one
continuously-updating WebSocket session — simpler than routing between pages
mid-question.)

## What's already been tested

Login/session auth, game + all-six-question-type creation, team + team-link
join flows, duplicate-name rejection, real-time join/team broadcasts,
collaborative team answering with locking, server-side scoring, early
question-end when all teams answer, timer-expiry auto-end, automatic
question progression, GM pause/resume/skip/restart/end controls, player kick
(forced disconnect), late-answer rejection, and reconnection (refresh
doesn't create a duplicate player and restores mid-question state) — all
exercised end-to-end against a running build.

What hasn't been exercised: a real multi-phone browser session (only
scripted WebSocket clients). Do a quick real-device run-through before the
event.
