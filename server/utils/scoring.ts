import type {
  PinAnswerConfig,
  PuzzleConfig,
  Question,
  QuizConfig,
  SliderConfig,
  TrueFalseConfig,
  TypeAnswerConfig
} from '#shared/types'

export interface EvaluationResult {
  correct: boolean
  score: number
}

/**
 * Kahoot-style scoring: correct answers earn between 30% and 100% of the
 * question's base points depending on how much time was remaining when the
 * team answered. Proximity-based question types (slider/pin) additionally
 * scale by an accuracy factor. Everything funnels through here so the
 * formula lives in exactly one place.
 */
function timeFactor(elapsedMs: number, timeLimitMs: number): number {
  const remaining = Math.max(0, timeLimitMs - elapsedMs)
  return Math.min(1, Math.max(0, remaining / timeLimitMs))
}

function speedScore(points: number, elapsedMs: number, timeLimitMs: number, accuracy = 1): number {
  const tf = timeFactor(elapsedMs, timeLimitMs)
  const raw = points * (0.3 + 0.7 * tf) * accuracy
  return Math.max(0, Math.round(raw))
}

function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function evaluateAnswer(
  question: Question,
  answer: unknown,
  elapsedMs: number
): EvaluationResult {
  const timeLimitMs = question.timeLimit * 1000

  switch (question.type) {
    case 'quiz': {
      const config = question.config as QuizConfig
      const idx = typeof answer === 'number' ? answer : Number(answer)
      const correct = idx === config.correctIndex
      return { correct, score: correct ? speedScore(question.points, elapsedMs, timeLimitMs) : 0 }
    }

    case 'true_false': {
      const config = question.config as TrueFalseConfig
      const bool = answer === true || answer === 'true'
      const correct = bool === config.correctAnswer
      return { correct, score: correct ? speedScore(question.points, elapsedMs, timeLimitMs) : 0 }
    }

    case 'type_answer': {
      const config = question.config as TypeAnswerConfig
      const given = normalizeText(String(answer ?? ''))
      const accepted = [config.correctAnswer, ...(config.acceptableAnswers || [])].map(normalizeText)
      const correct = accepted.includes(given) && given.length > 0
      return { correct, score: correct ? speedScore(question.points, elapsedMs, timeLimitMs) : 0 }
    }

    case 'slider': {
      const config = question.config as SliderConfig
      const value = Number(answer)
      if (Number.isNaN(value)) return { correct: false, score: 0 }
      const distance = Math.abs(value - config.correctValue)
      const tolerance = Math.max(1e-6, config.tolerance)
      const correct = distance <= tolerance
      if (!correct) return { correct: false, score: 0 }
      const accuracy = 1 - 0.5 * (distance / tolerance)
      return { correct, score: speedScore(question.points, elapsedMs, timeLimitMs, accuracy) }
    }

    case 'pin_answer': {
      const config = question.config as PinAnswerConfig
      const point = answer as { x: number; y: number } | null
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
        return { correct: false, score: 0 }
      }
      const distance = Math.hypot(point.x - config.correctX, point.y - config.correctY)
      const radius = Math.max(1e-6, config.radius)
      const correct = distance <= radius
      if (!correct) return { correct: false, score: 0 }
      const accuracy = 1 - 0.5 * (distance / radius)
      return { correct, score: speedScore(question.points, elapsedMs, timeLimitMs, accuracy) }
    }

    case 'puzzle': {
      const config = question.config as PuzzleConfig
      const order = answer as string[] | null
      const correct =
        Array.isArray(order) &&
        order.length === config.items.length &&
        order.every((item, idx) => item === config.items[idx])
      return { correct, score: correct ? speedScore(question.points, elapsedMs, timeLimitMs) : 0 }
    }

    default:
      return { correct: false, score: 0 }
  }
}

export function getCorrectAnswerDisplay(question: Question): unknown {
  switch (question.type) {
    case 'quiz': {
      const config = question.config as QuizConfig
      return { index: config.correctIndex, text: config.choices[config.correctIndex] }
    }
    case 'true_false':
      return (question.config as TrueFalseConfig).correctAnswer
    case 'type_answer':
      return (question.config as TypeAnswerConfig).correctAnswer
    case 'slider':
      return (question.config as SliderConfig).correctValue
    case 'pin_answer': {
      const config = question.config as PinAnswerConfig
      return { x: config.correctX, y: config.correctY, radius: config.radius }
    }
    case 'puzzle':
      return (question.config as PuzzleConfig).items
    default:
      return null
  }
}
