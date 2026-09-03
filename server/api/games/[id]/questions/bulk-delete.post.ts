import { requireGameMaster } from '../../../../utils/auth'
import { deleteQuestions, getGame, listQuestions } from '../../../../utils/repo'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const game = getGame(gameId)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })

  const body = await readBody<{ ids?: string[] }>(event)
  const existing = new Set(listQuestions(gameId).map((q) => q.id))
  const ids = (body?.ids ?? []).filter((id) => existing.has(id))
  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid question ids provided' })
  }

  deleteQuestions(ids)
  return listQuestions(gameId)
})
