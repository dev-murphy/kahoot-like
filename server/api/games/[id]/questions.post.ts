import type { QuestionConfig, QuestionType } from '#shared/types'
import { requireGameMaster } from '../../../utils/auth'
import { createQuestion, getGame, listQuestions } from '../../../utils/repo'
import { validateQuestionInput } from '../../../utils/questionValidation'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const game = getGame(gameId)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })

  const body = await readBody<{
    type?: QuestionType
    text?: string
    config?: QuestionConfig
    timeLimit?: number
    points?: number
  }>(event)

  const { type, text, config, timeLimit, points } = validateQuestionInput(body)
  const order = listQuestions(gameId).length

  return createQuestion({ gameId, type, text, config, timeLimit, points, order })
})
