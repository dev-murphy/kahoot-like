import { requireGameMaster } from '../../../../utils/auth'
import { notifyMaster } from '../../../../utils/catchupEngine'
import { deleteTeam, getCatchupSession, getTeam, listPlayers, listPlayersForSession, listTeamsForSession } from '../../../../utils/repo'
import { broadcast, broadcastToPlayers } from '../../../../utils/wsRegistry'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const teamId = getRouterParam(event, 'teamId')!
  const team = getTeam(teamId)
  if (!team || team.gameId !== gameId) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  if (team.sessionId) {
    const session = getCatchupSession(team.sessionId)
    if (session && session.status !== 'LOBBY') {
      throw createError({ statusCode: 409, statusMessage: 'Teams can only be changed before the catch-up session begins' })
    }
    if (listTeamsForSession(team.sessionId).length <= 1) {
      throw createError({ statusCode: 409, statusMessage: 'A catch-up session needs at least one team' })
    }
  }

  const affectedPlayers = listPlayers(gameId).filter((p) => p.teamId === teamId)
  // Capture the session's roster before deleting — once the team is gone, its players
  // no longer resolve back to this session through the team_id join.
  const catchupPlayerIds = team.sessionId ? new Set(listPlayersForSession(team.sessionId).map((p) => p.id)) : null
  deleteTeam(teamId)

  if (team.sessionId && catchupPlayerIds) {
    // Catch-up team — only its own session's players (and the Game Master) should hear about it.
    broadcastToPlayers(gameId, catchupPlayerIds, { type: 'TEAM_DELETED', teamId })
    for (const p of affectedPlayers) {
      broadcastToPlayers(gameId, catchupPlayerIds, { type: 'PLAYER_UPDATED', player: { ...p, teamId: null } })
    }
    notifyMaster(gameId)
  } else {
    broadcast(gameId, { type: 'TEAM_DELETED', teamId })
    for (const p of affectedPlayers) {
      broadcast(gameId, { type: 'PLAYER_UPDATED', player: { ...p, teamId: null } })
    }
  }

  return { ok: true }
})
