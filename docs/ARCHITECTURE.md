# Architecture

[← Back to README](../README.md)

## Stack

| Layer         | Choice                                                             |
| ------------- | ------------------------------------------------------------------- |
| App           | Nuxt 4 / Vue 3 / TypeScript / Tailwind — no separate backend project |
| REST API      | Nitro server routes (`server/api/**`) — auth, game/question/team CRUD, join flow |
| Real-time     | One WebSocket endpoint (`server/routes/ws.ts`, Nitro `defineWebSocketHandler`) drives lobby presence, question start/end, answering, live scoring, leaderboards |
| Persistence   | SQLite via `better-sqlite3` (`server/utils/db.ts`) — synchronous writes, so there's no race between concurrent WebSocket messages in the single Node process |
| Game state    | `server/utils/gameEngine.ts` — the single authoritative state machine for progress, timers, locking, and score awarding. The client only ever displays what the server sends it |
| Scoring       | `server/utils/scoring.ts` — one place, used for every question type |
| Client state  | Pinia (`app/stores/`): `liveGame.ts` (fed entirely by WebSocket messages) separate from `master.ts` (Game-Master-only UI state) |

## Game modes

| Mode         | Scoring unit | Notes |
| ------------ | ------------ | ----- |
| `TEAM`       | A team, shared across members | See team answering model below |
| `INDIVIDUAL` | Each player | Same engine/timer/locking rules, just a "team" of one — no team setup step |

## Team answering model

A team is one scoring unit, but every member can answer from their own
phone. The server tracks each submission; the moment any teammate submits a
*correct* answer, that team is locked for the question, everyone on the team
is notified immediately, and the score is awarded once. Incorrect answers
don't lock the team — teammates (including the same player) can keep trying
until time runs out or someone gets it. In `INDIVIDUAL` mode the same rules
apply per-player instead of per-team.

## Scoring

Kahoot-style: correct answers earn 30–100% of the question's base points
depending on how much time was left when the answer was submitted
(`server/utils/scoring.ts:speedScore`). Slider and Pin Answer questions
additionally scale by how close the answer was to the correct value. Wrong
answers score zero; scores never go negative.
