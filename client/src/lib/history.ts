import type { MistakesMap, Word } from './types';

export type MissRow = {
  en: string;
  ja: string;
  seen: number;
  misses: number;
  lastTs?: number;
};

/**
 * Compute the most-missed words from mistake stats, joined with meanings.
 *
 * misses = max(0, seen - correct). Rows with no misses are dropped.
 * Sorted by misses (desc), then most recently seen (desc), and capped at `n`.
 */
export function topMisses(mistakes: MistakesMap, words: Word[], n: number): MissRow[] {
  const ja = new Map(words.map((w) => [w.en, w.ja]));
  return Object.entries(mistakes)
    .map(([en, m]) => ({
      en,
      ja: ja.get(en) ?? '',
      seen: m.seen,
      misses: Math.max(0, m.seen - m.correct),
      lastTs: m.lastTs,
    }))
    .filter((r) => r.misses > 0)
    .sort((a, b) => b.misses - a.misses || (b.lastTs ?? 0) - (a.lastTs ?? 0))
    .slice(0, n);
}
