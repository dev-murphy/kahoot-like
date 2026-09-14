/** Strips leading/trailing punctuation from a word, leaving letters/numbers intact. */
export function stripPunctuation(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
}

/** Splits a full sentence into plain word tokens (punctuation stripped, empty tokens dropped). */
export function tokenizeAnswer(answer: string): string[] {
  return answer
    .trim()
    .split(/\s+/)
    .map(stripPunctuation)
    .filter(Boolean)
}
