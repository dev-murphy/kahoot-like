import { requireGameMaster } from '../../../../utils/auth'
import { listQuestions, reorderQuestions } from '../../../../utils/repo'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const body = await readBody<{ orderedIds?: string[] }>(event)
  const existing = new Set(listQuestions(gameId).map((q) => q.id))
  const orderedIds = (body?.orderedIds ?? []).filter((id) => existing.has(id))
  if (orderedIds.length !== existing.size) {
    throw createError({ statusCode: 400, statusMessage: 'orderedIds must include every question exactly once' })
  }
  reorderQuestions(gameId, orderedIds)
  return listQuestions(gameId)
})
