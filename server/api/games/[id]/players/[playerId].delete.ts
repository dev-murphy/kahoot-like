import { requireGameMaster } from '../../../../utils/auth'
import { deletePlayer, getPlayer } from '../../../../utils/repo'
import { broadcast, disconnectPlayerSockets } from '../../../../utils/wsRegistry'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const playerId = getRouterParam(event, 'playerId')!
  const player = getPlayer(playerId)
  if (!player || player.gameId !== gameId) throw createError({ statusCode: 404, statusMessage: 'Player not found' })

  deletePlayer(playerId)
  disconnectPlayerSockets(gameId, playerId, {
    type: 'KICKED',
    message: 'You have been removed from the game by the Game Master.'
  })
  broadcast(gameId, { type: 'PLAYER_LEFT', playerId })
  return { ok: true }
})
