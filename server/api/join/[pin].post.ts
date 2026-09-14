import { TEAM_COLORS } from '#shared/types'
import { getPlayerToken, setPlayerCookie } from '../../utils/auth'
import { notifyMaster as notifyCatchupMaster } from '../../utils/catchupEngine'
import {
  createPlayer,
  createTeam,
  findPlayerByNameInGame,
  getActiveCatchupSession,
  getGameByPin,
  getPlayerByToken,
  getTeam,
  listMainTeams,
  listPlayersForSession,
  listTeamsForSession
} from '../../utils/repo'
import { broadcast, broadcastToPlayers } from '../../utils/wsRegistry'

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

  const body = await readBody<{ name?: string; teamId?: string }>(event)
  const name = (body?.name ?? '').trim().slice(0, 24)
  if (name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Name must be at least 2 characters' })
  }
  if (findPlayerByNameInGame(game.id, name)) {
    throw createError({ statusCode: 409, statusMessage: 'That name is already taken in this game' })
  }

  if (game.status === 'LOBBY') {
    let teamId: string | null = null
    if (game.mode === 'INDIVIDUAL') {
      // Individual mode: every player is silently given their own 1-member team so the
      // existing team-keyed scoring/locking/leaderboard logic works unchanged.
      const existingTeams = listMainTeams(game.id)
      const color = TEAM_COLORS[existingTeams.length % TEAM_COLORS.length]!.value
      teamId = createTeam(game.id, name, color).id
    } else if (body?.teamId) {
      const team = getTeam(body.teamId)
      if (team && team.gameId === game.id && !team.sessionId) teamId = team.id
    }

    const { player, token } = createPlayer(game.id, name, teamId)
    setPlayerCookie(event, pin, token)

    broadcast(game.id, { type: 'PLAYER_JOINED', player })

    const team = teamId ? getTeam(teamId) : null
    return { player, team, gameId: game.id, pin, title: game.title, teams: listMainTeams(game.id) }
  }

  // Main session has moved on — route latecomers into the running catch-up
  // session, if the Game Master has started one, instead of the main game.
  const catchupSession = getActiveCatchupSession(game.id)
  if (!catchupSession) {
    throw createError({ statusCode: 409, statusMessage: 'This game has already started.' })
  }

  let teamId: string | null
  if (game.mode === 'INDIVIDUAL') {
    const existingTeams = listTeamsForSession(catchupSession.id)
    const color = TEAM_COLORS[existingTeams.length % TEAM_COLORS.length]!.value
    teamId = createTeam(game.id, name, color, catchupSession.id).id
  } else {
    const catchupTeams = listTeamsForSession(catchupSession.id)
    const picked = body?.teamId ? catchupTeams.find((t) => t.id === body.teamId) : undefined
    // Fall back to the first catch-up team if none was picked (or the pick was invalid) —
    // there's no ongoing Game Master "assign later" step once a catch-up session is running.
    teamId = picked?.id ?? catchupTeams[0]?.id ?? null
  }

  const { player, token } = createPlayer(game.id, name, teamId)
  setPlayerCookie(event, pin, token)

  const catchupPlayerIds = new Set(listPlayersForSession(catchupSession.id).map((p) => p.id))
  broadcastToPlayers(game.id, catchupPlayerIds, { type: 'PLAYER_JOINED', player })
  notifyCatchupMaster(game.id)

  const team = teamId ? getTeam(teamId) : null
  return { player, team, gameId: game.id, pin, title: game.title, teams: listTeamsForSession(catchupSession.id) }
})
