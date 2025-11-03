import { http } from './http'
import type { MistakesMap, MotivationStats, Word } from './types'

/**
 * Minimal axios wrapper returning JSON.
 */
async function getJson<T>(url: string): Promise<T> {
  const r = (await http.get(url)) as any
  return r.data as T
}

async function postJson<T>(url: string, data: any): Promise<T> {
  const r = (await http.post(url, data)) as any
  return r.data as T
}

/**
 * API endpoints
 */
export async function getHealth() {
  return getJson<{ ok: boolean }>('/api/health')
}

export async function getVoices() {
  const r = await getJson<{ voices: string[] }>('/api/voices')
  return r.voices
}

export async function getWords() {
  const r = await getJson<{ words: Word[] }>('/api/words')
  return r.words
}

export function ttsUrl(text: string, voice?: string | null) {
  const u = new URL('/api/tts', window.location.origin)
  u.searchParams.set('text', text)
  if (voice) u.searchParams.set('voice', voice)
  return u.pathname + u.search
}

export async function postResult(word: string, correct: boolean, ts = Date.now()) {
  await postJson('/api/stats/result', { word, correct, ts })
}

export async function getMistakes() {
  return getJson<MistakesMap>('/api/stats/mistakes')
}

export async function getMotivation() {
  return getJson<MotivationStats>('/api/stats/motivation')
}
