# Routes

[← Back to README](../README.md)

| Route | Who | Purpose |
| ----- | --- | ------- |
| `/`, `/join`, `/join/[pin]`, `/join/[pin]/team/[team]` | Player | Join flow (pick a game PIN, then a team if the game is in `TEAM` mode) |
| `/game/[pin]` | Player | The entire in-game experience — lobby → question → results → leaderboard → final results — driven by one WebSocket connection |
| `/master/login` | Game Master | Auth |
| `/master` | Game Master | Dashboard — list/create games |
| `/master/games/new` | Game Master | Create a game, pick `TEAM` or `INDIVIDUAL` mode |
| `/master/games/[id]` | Game Master | Question editor — add/edit/reorder/import/export questions, manage teams (if `TEAM` mode) |
| `/master/games/[id]/lobby` | Game Master | Pre-game lobby — QR code, join link, live join/team roster |
| `/master/games/[id]/play` | Game Master | In-game control panel — advance/pause/skip/end, live answer counts |
| `/master/games/[id]/results` | Game Master | Final results/leaderboard |

The player-facing results/leaderboard views were folded into the single
`/game/[pin]` page rather than separate routes, since it's all one
continuously-updating WebSocket session — simpler than routing between pages
mid-question.
