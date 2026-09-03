import { requireGameMaster } from '../../../utils/auth'
import { launchGame } from '../../../utils/gameEngine'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  try {
    return launchGame(gameId)
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : 'Could not launch game' })
  }
})
