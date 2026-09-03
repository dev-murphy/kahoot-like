import { requireGameMaster } from '../../../../utils/auth'
import { getPlayer, getTeam, setPlayerTeam } from '../../../../utils/repo'
import { broadcast } from '../../../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const playerId = getRouterParam(event, 'playerId')!
  const player = getPlayer(playerId)
  if (!player || player.gameId !== gameId) throw createError({ statusCode: 404, statusMessage: 'Player not found' })

  const body = await readBody<{ teamId?: string | null }>(event)
  if (body?.teamId) {
    const team = getTeam(body.teamId)
    if (!team || team.gameId !== gameId) throw createError({ statusCode: 400, statusMessage: 'Invalid team' })
  }

  setPlayerTeam(playerId, body?.teamId ?? null)
  const updated = getPlayer(playerId)!
  broadcast(gameId, { type: 'PLAYER_UPDATED', player: updated })
  return updated
})
