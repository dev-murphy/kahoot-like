import { requireGameMaster } from '../../../utils/auth'
import { startGame } from '../../../utils/gameEngine'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  try {
    startGame(gameId)
    return { ok: true }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : 'Could not start game' })
  }
})
