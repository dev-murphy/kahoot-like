export const BLANK_TOKEN = '{blank}'

export function countBlanks(template: string): number {
  return template.split(BLANK_TOKEN).length - 1
}

/** Splits a fill-blank template into alternating literal-text segments and `null` blank placeholders. */
export function splitTemplate(template: string): (string | null)[] {
  const parts = template.split(BLANK_TOKEN)
  const result: (string | null)[] = []
  parts.forEach((segment, idx) => {
    result.push(segment)
    if (idx < parts.length - 1) result.push(null)
  })
  return result
}
