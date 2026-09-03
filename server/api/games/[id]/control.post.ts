import { requireGameMaster } from '../../../utils/auth'
import { endGameEarly, pauseGame, restartQuestion, resumeGame, skipQuestion } from '../../../utils/gameEngine'

type ControlAction = 'pause' | 'resume' | 'skip' | 'end' | 'restart'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const body = await readBody<{ action?: ControlAction }>(event)

  switch (body?.action) {
    case 'pause':
      pauseGame(gameId)
      break
    case 'resume':
      resumeGame(gameId)
      break
    case 'skip':
      skipQuestion(gameId)
      break
    case 'end':
      endGameEarly(gameId)
      break
    case 'restart':
      restartQuestion(gameId)
      break
    default:
      throw createError({ statusCode: 400, statusMessage: 'Unknown control action' })
  }

  return { ok: true }
})
