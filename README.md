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

## Game modes

| Mode         | Description |
| ------------ | ----------- |
| `TEAM`       | Players join a team; the team is the scoring unit |
| `INDIVIDUAL` | Players compete on their own — no team setup step |

## Question types

Eight types, all with Kahoot-style speed scoring. See
**[docs/QUESTION_TYPES.md](docs/QUESTION_TYPES.md)** for the full breakdown.

| Type | Blurb |
| ---- | ----- |
| Quiz | Multiple choice |
| True or False | Two choices |
| Type Answer | Free text |
| Slider | Pick a number |
| Pin Answer | Tap the map |
| Puzzle | Put in order |
| Fill in the Blank | Complete the blanks |
| Complete the Text | Build the sentence |

## More docs

| Doc | Covers |
| --- | ------ |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, game modes, team answering model, scoring formula |
| [docs/QUESTION_TYPES.md](docs/QUESTION_TYPES.md) | Every question type in detail, including word-bank rules |
| [docs/ROUTES.md](docs/ROUTES.md) | Every route, player vs Game Master |
| [docs/TESTING.md](docs/TESTING.md) | What's been tested end-to-end and what hasn't |
