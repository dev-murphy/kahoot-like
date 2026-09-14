import { computeLeaderboard } from './gameEngine'
import * as repo from './repo'

export interface GameExport {
  game: ReturnType<typeof repo.getGame>
  questions: ReturnType<typeof repo.listQuestions>
  teams: ReturnType<typeof repo.listTeams>
  players: ReturnType<typeof repo.listPlayers>
  answers: ReturnType<typeof repo.getAnswersForGame>
  leaderboard: ReturnType<typeof computeLeaderboard>
}

/** Builds a full, self-contained export of a single game's data for backup/download. */
export function buildGameExport(gameId: string): GameExport | null {
  const game = repo.getGame(gameId)
  if (!game) return null
  return {
    game,
    questions: repo.listQuestions(gameId),
    teams: repo.listTeams(gameId),
    players: repo.listPlayers(gameId),
    answers: repo.getAnswersForGame(gameId),
    leaderboard: computeLeaderboard(gameId, new Map())
  }
}

/** Builds a full export bundle across every game on the platform. */
export function buildFullExport(): { exportedAt: number; games: GameExport[] } {
  const games = repo
    .listGames()
    .map((g) => buildGameExport(g.id))
    .filter((g): g is GameExport => g !== null)
  return { exportedAt: Date.now(), games }
}
