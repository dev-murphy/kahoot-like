# Testing status

[← Back to README](../README.md)

## Exercised end-to-end (scripted WebSocket clients)

| Area | Coverage |
| ---- | -------- |
| Auth | Login/session |
| Game setup | Game + all question type creation, `TEAM`/`INDIVIDUAL` mode, team + team-link join flows, duplicate-name rejection |
| Real-time | Join/team broadcasts, collaborative team answering with locking, reconnection (refresh doesn't duplicate a player and restores mid-question state) |
| Scoring | Server-side scoring for every question type |
| Game flow | Early question-end when all teams/players answer, timer-expiry auto-end, automatic question progression |
| GM controls | Pause/resume/skip/restart/end, player kick (forced disconnect), late-answer rejection |

## Not yet exercised

A real multi-phone browser session — only scripted WebSocket clients so far.
Do a quick real-device run-through before the event.
