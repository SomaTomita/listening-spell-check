import { Router } from 'express'
import { recordResult, getMistakes, getMotivation } from './db'

const router = Router()

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

