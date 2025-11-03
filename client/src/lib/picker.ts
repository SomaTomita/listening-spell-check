import type { MistakesMap, Word } from './types';

/**
 * Compute weight for a word based on mistakes map (streak, total wrong, recency bonus within 48h).
 */
function weightOf(word: Word, mistakes: MistakesMap): number {
  const m = mistakes[word.en];
  if (!m) return 1;
  const totalWrong = Math.max(0, m.seen - m.correct);
  const streak = m.streakWrong;
  const now = Date.now();
  const recencyBonus = m.lastTs && now - m.lastTs < 48 * 3600_000 ? 1 : 0;
  return 1 + Math.min(3, streak) + Math.min(2, totalWrong) + recencyBonus;
}

/**
 * Weighted random pick. Allows duplicates across rounds; caller manages history if needed.
 */
export function pickUpWord(words: Word[], mistakes: MistakesMap): Word {
  if (words.length === 0) throw new Error('no_words');
  const weights = words.map((w) => weightOf(w, mistakes));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < words.length; i++) {
    r -= weights[i];
    if (r <= 0) return words[i];
  }
  return words[words.length - 1];
}
