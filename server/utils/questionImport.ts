import type { QuestionConfig, QuestionType } from '#shared/types'

type ImportDifficulty = 'easy' | 'medium' | 'hard' | 'extreme'

const DIFFICULTY_POINTS: Record<ImportDifficulty, number> = {
  easy: 1000,
  medium: 1500,
  hard: 2000,
  extreme: 2500
}

const TYPE_MAP: Record<string, QuestionType> = {
  true_false: 'true_false',
  multiple_choice: 'quiz',
  slider: 'slider',
  order: 'puzzle',
  type_answer: 'type_answer',
  fill_blank: 'fill_blank',
  complete_text: 'complete_text'
}

export interface RawImportQuestion {
  difficulty?: string
  type?: string
  timeLimitSeconds?: number
  /** Alternate name for timeLimitSeconds used by some export formats. */
  term?: number
  /** Free-text metadata (e.g. book/section) — accepted but not stored. */
  scope?: string
  question?: string
  /** Alternate name for `question` (the display prompt), used by fill_blank/complete_text exports. */
  prompt?: string
  // true_false
  // complete_text (full sentence — same key reused for its answer string)
  answer?: boolean | string
  // multiple_choice
  options?: string[]
  correctIndex?: number
  // slider
  min?: number
  max?: number
  correctValue?: number
  tolerance?: number
  // order
  items?: string[]
  correctOrder?: string[]
  // type_answer
  correctAnswer?: string
  acceptableAnswers?: string[]
  // fill_blank (template text with {blank} tokens)
  text?: string
  answers?: string[]
  // fill_blank / complete_text
  wordBank?: string[]
}

export interface TransformedQuestion {
  type: QuestionType
  text?: string
  config: QuestionConfig
  timeLimit?: number
  points: number
}

/**
 * Converts one upload-JSON question into the app's internal question shape.
 * `difficulty` maps to a fixed point value (easy=1000, medium=1500, hard=2000, extreme=2500); unrecognized/missing defaults to medium.
 */
export function transformImportQuestion(raw: RawImportQuestion): TransformedQuestion {
  const internalType = raw.type ? TYPE_MAP[raw.type] : undefined
  if (!internalType) {
    throw createError({ statusCode: 400, statusMessage: `Unsupported question type "${raw.type}"` })
  }

  const points = DIFFICULTY_POINTS[raw.difficulty as ImportDifficulty] ?? DIFFICULTY_POINTS.medium

  let config: QuestionConfig
  switch (internalType) {
    case 'true_false':
      config = { correctAnswer: raw.answer as boolean }
      break
    case 'quiz':
      config = { choices: raw.options ?? [], correctIndex: raw.correctIndex as number }
      break
    case 'slider':
      config = {
        min: raw.min as number,
        max: raw.max as number,
        correctValue: raw.correctValue as number,
        tolerance: raw.tolerance as number
      }
      break
    case 'puzzle':
      config = { items: raw.correctOrder ?? raw.items ?? [] }
      break
    case 'type_answer': {
      const accepted = raw.acceptableAnswers ?? []
      config = {
        correctAnswer: raw.correctAnswer ?? accepted[0] ?? '',
        acceptableAnswers: accepted
      }
      break
    }
    case 'fill_blank':
      config = { template: raw.text ?? '', answers: raw.answers ?? [], wordBank: raw.wordBank ?? [] }
      break
    case 'complete_text':
      config = { answer: (raw.answer as string) ?? '', wordBank: raw.wordBank ?? [] }
      break
    default:
      throw createError({ statusCode: 400, statusMessage: `Unsupported question type "${raw.type}"` })
  }

  return {
    type: internalType,
    text: raw.prompt ?? raw.question,
    config,
    timeLimit: raw.timeLimitSeconds ?? raw.term,
    points
  }
}
