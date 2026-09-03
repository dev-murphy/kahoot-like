import type { QuestionConfig, QuestionType } from '#shared/types'

const VALID_TYPES: QuestionType[] = ['quiz', 'true_false', 'type_answer', 'slider', 'pin_answer', 'puzzle']

function bad(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

export function validateQuestionInput(body: {
  type?: QuestionType
  text?: string
  config?: QuestionConfig
  timeLimit?: number
  points?: number
}): { type: QuestionType; text: string; config: QuestionConfig; timeLimit: number; points: number } {
  const { type, text, config } = body
  if (!type || !VALID_TYPES.includes(type)) bad('Invalid question type')
  if (!text || !text.trim()) bad('Question text is required')

  const timeLimit = Number(body.timeLimit)
  if (!Number.isFinite(timeLimit) || timeLimit < 5 || timeLimit > 300) bad('Time limit must be between 5 and 300 seconds')

  const points = Number(body.points)
  if (!Number.isFinite(points) || points < 0 || points > 5000) bad('Points must be between 0 and 5000')

  if (!config) bad('Question configuration is required')

  switch (type) {
    case 'quiz': {
      const c = config as { choices?: string[]; correctIndex?: number }
      if (!Array.isArray(c.choices) || c.choices.length < 2 || c.choices.length > 4) {
        bad('Quiz questions need 2-4 answer choices')
      }
      if (c.choices!.some((choice) => !choice || !choice.trim())) bad('Answer choices cannot be empty')
      if (
        typeof c.correctIndex !== 'number' ||
        c.correctIndex < 0 ||
        c.correctIndex >= c.choices!.length
      ) {
        bad('A valid correct answer must be selected')
      }
      break
    }
    case 'true_false': {
      const c = config as { correctAnswer?: boolean }
      if (typeof c.correctAnswer !== 'boolean') bad('Select true or false as the correct answer')
      break
    }
    case 'type_answer': {
      const c = config as { correctAnswer?: string }
      if (!c.correctAnswer || !c.correctAnswer.trim()) bad('A correct answer is required')
      break
    }
    case 'slider': {
      const c = config as { min?: number; max?: number; correctValue?: number; tolerance?: number }
      if (
        typeof c.min !== 'number' ||
        typeof c.max !== 'number' ||
        typeof c.correctValue !== 'number' ||
        typeof c.tolerance !== 'number'
      ) {
        bad('Slider min, max, correct value and tolerance are required')
      }
      if (c.max! <= c.min!) bad('Slider max must be greater than min')
      if (c.correctValue! < c.min! || c.correctValue! > c.max!) bad('Correct value must be within min/max range')
      if (c.tolerance! <= 0) bad('Tolerance must be greater than 0')
      break
    }
    case 'pin_answer': {
      const c = config as { imageUrl?: string; correctX?: number; correctY?: number; radius?: number }
      if (!c.imageUrl || !c.imageUrl.trim()) bad('A background image is required')
      if (typeof c.correctX !== 'number' || typeof c.correctY !== 'number') {
        bad('A correct location must be selected on the image')
      }
      if (c.correctX! < 0 || c.correctX! > 1 || c.correctY! < 0 || c.correctY! > 1) {
        bad('Correct location must be within the image bounds')
      }
      if (typeof c.radius !== 'number' || c.radius <= 0 || c.radius > 1) bad('Radius must be between 0 and 1')
      break
    }
    case 'puzzle': {
      const c = config as { items?: string[] }
      if (!Array.isArray(c.items) || c.items.length < 2) bad('Puzzle needs at least 2 items to order')
      if (c.items!.some((item) => !item || !item.trim())) bad('Puzzle items cannot be empty')
      break
    }
  }

  return { type: type!, text: text!.trim(), config: config!, timeLimit, points }
}
