import type { LeaderboardEntry } from '#shared/types'
import * as repo from './repo'

/**
 * Ranks every team on the game (main-session and any catch-up sessions
 * alike — a team is a team regardless of which session created it), so a
 * catch-up session's scores are automatically folded into the same board.
 */
export function computeLeaderboard(gameId: string, previousRanks: Map<string, number>): LeaderboardEntry[] {
  const teams = repo.listTeams(gameId)
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return sorted.map((t, idx) => ({
    teamId: t.id,
    name: t.name,
    color: t.color,
    score: t.score,
    rank: idx + 1,
    previousRank: previousRanks.get(t.id) ?? null
  }))
}
