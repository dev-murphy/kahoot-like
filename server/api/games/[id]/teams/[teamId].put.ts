import { requireGameMaster } from '../../../../utils/auth'
import { getTeam, updateTeam } from '../../../../utils/repo'
import { broadcast } from '../../../../utils/wsRegistry'

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
  broadcast(gameId, { type: 'TEAM_UPDATED', team: updated })
  return updated
})
