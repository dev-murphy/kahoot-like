import { requireGameMaster } from '../../../../utils/auth'
import { deleteTeam, getTeam, listPlayers } from '../../../../utils/repo'
import { broadcast } from '../../../../utils/wsRegistry'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const teamId = getRouterParam(event, 'teamId')!
  const team = getTeam(teamId)
  if (!team || team.gameId !== gameId) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  const affectedPlayers = listPlayers(gameId).filter((p) => p.teamId === teamId)
  deleteTeam(teamId)
  broadcast(gameId, { type: 'TEAM_DELETED', teamId })
  for (const p of affectedPlayers) {
    broadcast(gameId, { type: 'PLAYER_UPDATED', player: { ...p, teamId: null } })
  }
  return { ok: true }
})
