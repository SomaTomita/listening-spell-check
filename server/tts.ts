import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import say from 'say'

/**
 * List available system voices on macOS via say.getInstalledVoices.
 */
export async function listVoices(): Promise<string[]> {
  const fallback = ['Alex', 'Samantha', 'Daniel', 'Serena']
  return new Promise(resolve => {
    try {
      const anySay: any = say as any
      if (typeof anySay.getInstalledVoices !== 'function') return resolve(fallback)
      anySay.getInstalledVoices((err: any, voices: string[]) => {
        if (Array.isArray(voices) && voices.length > 0) return resolve(voices)
        return resolve(fallback)
      })
    } catch {
      resolve(fallback)
    }
  })
}

/**
 * Generate a WAV file for the given text and return its absolute path.
 * The caller is responsible for deleting the file after streaming.
 */
export async function synthesizeToWav(text: string, voice?: string, speed = 0.9): Promise<string> {
  const tmpDir = path.join(process.cwd(), 'server', 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  const filename = `${Date.now()}-${randomUUID()}.wav`
  const outPath = path.join(tmpDir, filename)
  await new Promise<void>((resolve, reject) => {
    // say.export(text, voice?, speed?, filename, cb)
    ;(say as any).export(text, voice || undefined, speed, outPath, (err: any) => {
      if (err) return reject(err)
      resolve()
    })
  })
  return outPath
}

/**
 * Utility to safely remove a file if it exists.
 */
export function safeUnlink(filePath: string) {
  try {
    fs.unlinkSync(filePath)
  } catch {}
}
