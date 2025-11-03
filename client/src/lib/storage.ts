import type { Settings } from './types';

const KEY = 'spell.practice.settings';

/**
 * Load persisted settings from localStorage or return defaults.
 */
export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { voice: null, volume: 1, darkMode: true };
    const obj = JSON.parse(raw);
    return {
      voice: obj.voice ?? null,
      volume: typeof obj.volume === 'number' ? obj.volume : 1,
      darkMode: Boolean(obj.darkMode ?? true),
    };
  } catch {
    return { voice: null, volume: 1, darkMode: true };
  }
}

/**
 * Persist settings to localStorage.
 */
export function setSettings(next: Settings) {
  localStorage.setItem(KEY, JSON.stringify(next));
}
