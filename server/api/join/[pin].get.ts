import { slugify } from '#shared/utils/slug'
import { getPlayerToken } from '../../utils/auth'
import {
  getActiveCatchupSession,
  getGameByPin,
  getPlayerByToken,
  listMainPlayers,
  listMainTeams,
  listPlayersForSession,
  listTeamsForSession
} from '../../utils/repo'

export default defineEventHandler((event) => {
  const pin = getRouterParam(event, 'pin')!
  const game = getGameByPin(pin)
  if (!game) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid Game PIN' })
  }

  const token = getPlayerToken(event, pin)
  const existingPlayer = token ? getPlayerByToken(token) : null
  const alreadyJoined = existingPlayer && existingPlayer.gameId === game.id ? existingPlayer : null

  // Once the main session has moved past LOBBY, latecomers can still join a
  // running catch-up session (if the Game Master has started one) — same PIN.
  const catchupSession = game.status !== 'LOBBY' ? getActiveCatchupSession(game.id) : null

  const teams = catchupSession ? listTeamsForSession(catchupSession.id) : listMainTeams(game.id)
  const players = catchupSession ? listPlayersForSession(catchupSession.id) : listMainPlayers(game.id)
  const teamCounts = new Map<string, number>()
  for (const p of players) {
    if (p.teamId) teamCounts.set(p.teamId, (teamCounts.get(p.teamId) ?? 0) + 1)
  }

  return {
    gameId: game.id,
    title: game.title,
    status: game.status,
    mode: game.mode,
    joinable: game.status === 'LOBBY' || !!catchupSession,
    catchup: !!catchupSession,
    teams: teams.map((t) => ({ id: t.id, name: t.name, color: t.color, slug: slugify(t.name), memberCount: teamCounts.get(t.id) ?? 0 })),
    alreadyJoined
  }
})
