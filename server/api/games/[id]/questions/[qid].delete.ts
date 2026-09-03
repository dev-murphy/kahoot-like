import { requireGameMaster } from '../../../../utils/auth'
import { deleteQuestion, getQuestion, listQuestions, reorderQuestions } from '../../../../utils/repo'

export default defineEventHandler((event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const qid = getRouterParam(event, 'qid')!
  const existing = getQuestion(qid)
  if (!existing || existing.gameId !== gameId) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }
  deleteQuestion(qid)
  const remaining = listQuestions(gameId)
  reorderQuestions(
    gameId,
    remaining.map((q) => q.id)
  )
  return { ok: true }
})
