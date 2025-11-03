/**
 * Normalize a string for spelling comparison: trim, lowercase, strip punctuation/symbols, collapse spaces.
 */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, '')
    .replace(/\s+/g, ' ')
}

/**
 * Compare input vs answer allowing hyphen/space variation and basic spellingMap substitutions.
 */
export function spellingEqual(input: string, answer: string, spellingMap?: Record<string, string>) {
  const i = normalize(input)
  const mapped = spellingMap && spellingMap[input] ? spellingMap[input] : answer
  const a = normalize(mapped)
  return i.replace(/[-\s]/g, ' ') === a.replace(/[-\s]/g, ' ')
}
