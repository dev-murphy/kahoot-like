import { requireGameMaster } from '../../utils/auth'
import { getGame, updateGameTitle } from '../../utils/repo'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const id = getRouterParam(event, 'id')!
  const game = getGame(id)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  const body = await readBody<{ title?: string }>(event)
  if (typeof body?.title === 'string' && body.title.trim()) {
    updateGameTitle(id, body.title.trim())
  }
  return getGame(id)
})
