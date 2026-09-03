import type { QuestionConfig, QuestionType } from '#shared/types'
import { requireGameMaster } from '../../../../utils/auth'
import { getQuestion, updateQuestion } from '../../../../utils/repo'
import { validateQuestionInput } from '../../../../utils/questionValidation'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const qid = getRouterParam(event, 'qid')!
  const existing = getQuestion(qid)
  if (!existing || existing.gameId !== gameId) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  const body = await readBody<{
    type?: QuestionType
    text?: string
    config?: QuestionConfig
    timeLimit?: number
    points?: number
  }>(event)

  const { type, text, config, timeLimit, points } = validateQuestionInput(body)
  updateQuestion(qid, { type, text, config, timeLimit, points, order: existing.order })
  return getQuestion(qid)
})
