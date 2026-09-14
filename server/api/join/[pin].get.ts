import { slugify } from '#shared/utils/slug'
import { getPlayerToken } from '../../utils/auth'
import { getGameByPin, getPlayerByToken, listPlayers, listTeams } from '../../utils/repo'

export default defineEventHandler((event) => {
  const pin = getRouterParam(event, 'pin')!
  const game = getGameByPin(pin)
  if (!game) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid Game PIN' })
  }

  const teams = listTeams(game.id)
  const players = listPlayers(game.id)
  const teamCounts = new Map<string, number>()
  for (const p of players) {
    if (p.teamId) teamCounts.set(p.teamId, (teamCounts.get(p.teamId) ?? 0) + 1)
  }

  const token = getPlayerToken(event, pin)
  const existingPlayer = token ? getPlayerByToken(token) : null
  const alreadyJoined = existingPlayer && existingPlayer.gameId === game.id ? existingPlayer : null

  return {
    gameId: game.id,
    title: game.title,
    status: game.status,
    mode: game.mode,
    joinable: game.status === 'LOBBY',
    teams: teams.map((t) => ({ id: t.id, name: t.name, color: t.color, slug: slugify(t.name), memberCount: teamCounts.get(t.id) ?? 0 })),
    alreadyJoined
  }
})
