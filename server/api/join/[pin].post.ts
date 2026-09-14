import { TEAM_COLORS } from '#shared/types'
import { getPlayerToken, setPlayerCookie } from '../../utils/auth'
import {
  createPlayer,
  createTeam,
  findPlayerByNameInGame,
  getGameByPin,
  getPlayerByToken,
  getTeam,
  listTeams
} from '../../utils/repo'
import { broadcast } from '../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  const pin = getRouterParam(event, 'pin')!
  const game = getGameByPin(pin)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Invalid Game PIN' })

  // Reconnect flow: already-joined players keep their identity.
  const existingToken = getPlayerToken(event, pin)
  const existingPlayer = existingToken ? getPlayerByToken(existingToken) : null
  if (existingPlayer && existingPlayer.gameId === game.id) {
    const team = existingPlayer.teamId ? getTeam(existingPlayer.teamId) : null
    return { player: existingPlayer, team, gameId: game.id, pin, title: game.title }
  }

  if (game.status !== 'LOBBY') {
    throw createError({ statusCode: 409, statusMessage: 'This game has already started.' })
  }

  const body = await readBody<{ name?: string; teamId?: string }>(event)
  const name = (body?.name ?? '').trim().slice(0, 24)
  if (name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Name must be at least 2 characters' })
  }

  if (findPlayerByNameInGame(game.id, name)) {
    throw createError({ statusCode: 409, statusMessage: 'That name is already taken in this game' })
  }

  let teamId: string | null = null
  if (game.mode === 'INDIVIDUAL') {
    // Individual mode: every player is silently given their own 1-member team so the
    // existing team-keyed scoring/locking/leaderboard logic works unchanged.
    const existingTeams = listTeams(game.id)
    const color = TEAM_COLORS[existingTeams.length % TEAM_COLORS.length]!.value
    teamId = createTeam(game.id, name, color).id
  } else if (body?.teamId) {
    const team = getTeam(body.teamId)
    if (team && team.gameId === game.id) teamId = team.id
  }

  const { player, token } = createPlayer(game.id, name, teamId)
  setPlayerCookie(event, pin, token)

  broadcast(game.id, { type: 'PLAYER_JOINED', player })

  const team = teamId ? getTeam(teamId) : null
  return { player, team, gameId: game.id, pin, title: game.title, teams: listTeams(game.id) }
})
