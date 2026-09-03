import { requireGameMaster } from '../../../../utils/auth'
import { createQuestions, getGame, listQuestions } from '../../../../utils/repo'
import { validateQuestionInput } from '../../../../utils/questionValidation'
import { transformImportQuestion, type RawImportQuestion } from '../../../../utils/questionImport'

export default defineEventHandler(async (event) => {
  requireGameMaster(event)
  const gameId = getRouterParam(event, 'id')!
  const game = getGame(gameId)
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })

  const body = await readBody<{ questions?: RawImportQuestion[] }>(event)
  const rawQuestions = body?.questions
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No questions found in file' })
  }

  const prepared = rawQuestions.map((raw, index) => {
    try {
      return validateQuestionInput(transformImportQuestion(raw))
    } catch (e) {
      const message = (e as { statusMessage?: string })?.statusMessage ?? 'Invalid question'
      throw createError({ statusCode: 400, statusMessage: `Question ${index + 1}: ${message}` })
    }
  })

  const startOrder = listQuestions(gameId).length
  return createQuestions(gameId, startOrder, prepared)
})
