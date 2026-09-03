import { requireGameMaster } from '../../utils/auth'
import { removeRuntime } from '../../utils/gameEngine'
import { deleteGame, getGame } from '../../utils/repo'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const id = getRouterParam(event, 'id')!
  const game = getGame(id)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  removeRuntime(id)
  deleteGame(id)
  return { ok: true }
})
