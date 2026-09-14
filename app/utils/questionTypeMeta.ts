import type { QuestionType } from '#shared/types'

export interface QuestionTypeMeta {
  type: QuestionType
  label: string
  /** Path to the icon SVG under /public/questions-icon. */
  icon: string
  blurb: string
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  { type: 'quiz', label: 'Quiz', icon: '/questions-icon/quiz.svg', blurb: 'Multiple choice' },
  { type: 'true_false', label: 'True or false', icon: '/questions-icon/true-or-false.svg', blurb: 'Two choices' },
  { type: 'type_answer', label: 'Type answer', icon: '/questions-icon/type-answer.svg', blurb: 'Free text' },
  { type: 'slider', label: 'Slider', icon: '/questions-icon/slider.svg', blurb: 'Pick a number' },
  { type: 'pin_answer', label: 'Pin answer', icon: '/questions-icon/pin-answer.svg', blurb: 'Tap the map' },
  { type: 'puzzle', label: 'Puzzle', icon: '/questions-icon/puzzle.svg', blurb: 'Put in order' },
  { type: 'fill_blank', label: 'Fill in the Blank', icon: '/questions-icon/fill-in-the-blank.svg', blurb: 'Complete the blanks' },
  { type: 'complete_text', label: 'Complete the Text', icon: '/questions-icon/complete-text.svg', blurb: 'Build the sentence' }
]

export const QUESTION_TYPE_MAP = Object.fromEntries(QUESTION_TYPES.map((t) => [t.type, t])) as Record<
  QuestionType,
  QuestionTypeMeta
>
