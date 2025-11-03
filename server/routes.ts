import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { getMistakes, getMotivation, recordResult } from './db.ts'
import { listVoices, safeUnlink, synthesizeToWav } from './tts.ts'

const router = Router()

// Health and meta
router.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// Voices
router.get('/voices', async (_req, res) => {
  try {
    const voices = await listVoices()
    res.json({ voices })
  } catch (e) {
    res.status(500).json({ error: 'tts_voices_failed' })
  }
})

// ローカル用途のため、APIは認証不要

// TTS: stream a single WAV, caller is expected to play once
router.get('/tts', async (req, res) => {
  const text = String(req.query.text || '')
  const voice = req.query.voice ? String(req.query.voice) : undefined
  const qSpeed = req.query.speed ?? req.query.rate
  const sp =
    typeof qSpeed === 'string' && qSpeed.trim() !== ''
      ? Math.max(0.5, Math.min(1.5, Number(qSpeed)))
      : undefined
  if (!text) return res.status(400).json({ error: 'text_required' })
  let wavPath: string | null = null
  const tryVoices: (string | undefined)[] = [voice, 'Alex', undefined]
  for (const v of tryVoices) {
    try {
      wavPath = await synthesizeToWav(text, v, sp as any)
      res.setHeader('Content-Type', 'audio/wav')
      const stream = fs.createReadStream(wavPath)
      stream.on('close', () => {
        if (wavPath) safeUnlink(wavPath)
      })
      stream.on('error', () => {
        if (wavPath) safeUnlink(wavPath)
      })
      stream.pipe(res)
      return
    } catch (e) {
      if (wavPath) {
        safeUnlink(wavPath)
        wavPath = null
      }
      // try next voice
    }
  }
  res.status(500).json({ error: 'tts_failed' })
})

// Words from assets
router.get('/words', (_req, res) => {
  try {
    const file = path.join(process.cwd(), 'assets', 'words', 'words.json')
    const buf = fs.readFileSync(file, 'utf-8')
    const words = JSON.parse(buf)
    res.json({ words })
  } catch (e) {
    res.status(500).json({ error: 'words_load_failed' })
  }
})

router.post('/stats/result', (req, res) => {
  const { word, correct, ts } = req.body || {}
  if (!word || typeof correct !== 'boolean') return res.status(400).json({ error: 'bad_request' })
  const timestamp = typeof ts === 'number' ? ts : Date.now()
  recordResult(String(word), Boolean(correct), timestamp)
  res.json({ ok: true })
})

router.get('/stats/mistakes', (_req, res) => {
  res.json(getMistakes())
})

router.get('/stats/motivation', (_req, res) => {
  res.json(getMotivation())
})

export default router
