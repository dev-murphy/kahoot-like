import type {
  PinAnswerConfig,
  PublicQuestion,
  PuzzleConfig,
  Question,
  QuizConfig,
  SliderConfig
} from '#shared/types'

/** Client-side mirror of the server sanitizer, used only for the Game Master's own question preview. */
export function sanitizeQuestionClient(question: Question): PublicQuestion {
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
      return { ...base, config: { items: config.items } }
    }
    default:
      return { ...base, config: {} }
  }
}
