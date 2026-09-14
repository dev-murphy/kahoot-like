import { requireGameMaster } from '../../../../utils/auth'
import { notifyMaster } from '../../../../utils/catchupEngine'
import { getTeam, listPlayersForSession, updateTeam } from '../../../../utils/repo'
import { broadcast, broadcastToPlayers } from '../../../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const teamId = getRouterParam(event, 'teamId')!
  const team = getTeam(teamId)
  if (!team || team.gameId !== gameId) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  const body = await readBody<{ name?: string; color?: string }>(event)
  updateTeam(teamId, {
    name: body?.name?.trim() || undefined,
    color: body?.color || undefined
  })
  const updated = getTeam(teamId)!

  if (updated.sessionId) {
    const catchupPlayerIds = new Set(listPlayersForSession(updated.sessionId).map((p) => p.id))
    broadcastToPlayers(gameId, catchupPlayerIds, { type: 'TEAM_UPDATED', team: updated })
    notifyMaster(gameId)
  } else {
    broadcast(gameId, { type: 'TEAM_UPDATED', team: updated })
  }

  return updated
})
