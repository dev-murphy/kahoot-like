import type {
  PinAnswerConfig,
  PublicQuestion,
  PuzzleConfig,
  Question,
  QuizConfig,
  SliderConfig
} from '#shared/types'

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

/** Strips correct-answer data from a question before it is sent to players. */
export function sanitizeQuestion(question: Question): PublicQuestion {
  const base = {
    id: question.id,
    gameId: question.gameId,
    type: question.type,
    text: question.text,
    timeLimit: question.timeLimit,
    points: question.points,
    order: question.order
  }

  switch (question.type) {
    case 'quiz': {
      const config = question.config as QuizConfig
      return { ...base, config: { choices: config.choices } }
    }
    case 'true_false':
      return { ...base, config: {} }
    case 'type_answer':
      return { ...base, config: {} }
    case 'slider': {
      const config = question.config as SliderConfig
      return { ...base, config: { min: config.min, max: config.max, step: config.step ?? 1 } }
    }
    case 'pin_answer': {
      const config = question.config as PinAnswerConfig
      return { ...base, config: { imageUrl: config.imageUrl } }
    }
    case 'puzzle': {
      const config = question.config as PuzzleConfig
      return { ...base, config: { items: shuffle(config.items) } }
    }
    default:
      return { ...base, config: {} }
  }
}
