import type { QuestionConfig, QuestionType } from '#shared/types'
import { countBlanks } from '#shared/utils/fillBlank'
import { tokenizeAnswer } from '#shared/utils/tokenize'

const VALID_TYPES: QuestionType[] = [
  'quiz',
  'true_false',
  'type_answer',
  'slider',
  'pin_answer',
  'puzzle',
  'fill_blank',
  'complete_text'
]

function bad(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

function normalizeKey(word: string): string {
  return word.trim().toLowerCase()
}

/** Case-insensitive multiset containment: does `bank` have enough copies to cover every entry in `required`? */
function hasSufficientCopies(bank: string[], required: string[]): boolean {
  const counts = new Map<string, number>()
  for (const word of bank) {
    const key = normalizeKey(word)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  for (const word of required) {
    const key = normalizeKey(word)
    const remaining = (counts.get(key) ?? 0) - 1
    if (remaining < 0) return false
    counts.set(key, remaining)
  }
  return true
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
      if (c.tolerance! < 0) bad('Tolerance cannot be negative')
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
    case 'fill_blank': {
      const c = config as { template?: string; answers?: string[]; wordBank?: string[] }
      if (typeof c.template !== 'string' || !c.template.trim()) bad('Fill in the blank needs template text')
      const blanks = countBlanks(c.template!)
      if (blanks < 1) bad('Fill in the blank text must contain at least one {blank}')
      if (!Array.isArray(c.answers) || c.answers.length !== blanks) {
        bad(`Fill in the blank needs exactly ${blanks} answer(s) to match the {blank} count`)
      }
      if (c.answers!.some((a) => !a || !a.trim())) bad('Fill in the blank answers cannot be empty')
      if (!Array.isArray(c.wordBank) || c.wordBank.length < 2) bad('Fill in the blank needs a word bank with at least 2 words')
      if (c.wordBank!.some((w) => !w || !w.trim())) bad('Word bank words cannot be empty')
      if (!hasSufficientCopies(c.wordBank!, c.answers!)) {
        bad('Word bank must contain enough copies of each answer word to fill every blank')
      }
      break
    }
    case 'complete_text': {
      const c = config as { answer?: string; wordBank?: string[] }
      if (typeof c.answer !== 'string' || !c.answer.trim()) bad('Complete the text needs an answer sentence')
      const tokens = tokenizeAnswer(c.answer!)
      if (tokens.length < 2) bad('Complete the text answer needs at least 2 words')
      if (!Array.isArray(c.wordBank) || c.wordBank.length < tokens.length) {
        bad('Word bank must contain at least as many words as the answer')
      }
      if (c.wordBank!.some((w) => !w || !w.trim())) bad('Word bank words cannot be empty')
      if (!hasSufficientCopies(c.wordBank!, tokens)) {
        bad('Word bank must contain enough copies of each word in the answer')
      }
      break
    }
  }

  return { type: type!, text: text!.trim(), config: config!, timeLimit, points }
}
