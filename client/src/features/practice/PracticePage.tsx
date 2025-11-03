import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import Countdown from './Countdown'
import { usePractice } from './usePractice'

/**
 * One-question practice screen: countdown, single playback, input, grading, and next.
 */
export default function PracticePage() {
  const { state, setInput, setVoice, setVolume, start, submit, next, canStart } = usePractice()
  const { current, countdown, input, feedback, voices, settings, note, played } = state

  const [guardMsg, setGuardMsg] = useState<string | null>(null)
  const canGoNext = played && feedback.correct !== null
  const handleNext = () => {
    if (!canGoNext) {
      setGuardMsg('先にEnterで採点してください')
      window.setTimeout(() => setGuardMsg(null), 1400)
      return
    }
    next()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault()
        start()
        return
      }
      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [start, handleNext])

  const Card = styled(Paper)`
    padding: 20px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
  `
  const Note = styled('div')`
    text-align: center;
    opacity: 0.75;
    margin-top: 6px;
    font-size: 12px;
    white-space: pre-line;
  `
  const Actions = styled('div')`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    min-height: 40px;
  `

  const VOICE_LABEL: Record<string, string> = {
    Samantha: '英語(US)・女性',
    Alex: '英語(US)・男性',
    Daniel: '英語(UK)・男性',
    Serena: '英語(UK)・女性',
    Karen: '英語(AU)・女性',
    Moira: '英語(IE)・女性',
    Tessa: '英語(ZA)・女性',
  }

  const labelFor = (v: string) => (VOICE_LABEL[v] ? `${v} (${VOICE_LABEL[v]})` : v)

  const pop = keyframes`
    0% { transform: scale(0.8); opacity: 0; }
    60% { transform: scale(1.06); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  `

  const PageWrap = styled('div')`
    position: relative;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `

  return (
    <PageWrap>
      <Box>
        <Note>{note}</Note>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Voice</InputLabel>
          <Select
            label="Voice"
            value={settings.voice ?? ''}
            onChange={e => setVoice(String(e.target.value))}
          >
            {(voices.length ? voices : ['Samantha', 'Daniel', 'Alex', 'Serena']).map(v => (
              <MenuItem key={v} value={v}>
                {labelFor(v)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: 160 }}>
          <Typography variant="caption">Volume</Typography>
          <Slider
            size="small"
            value={Math.round((settings.volume ?? 1) * 100)}
            onChange={(_, v) => setVolume(Number(v) / 100)}
          />
        </Box>
      </Stack>

      <Card elevation={0}>
        <Actions>
          <Tooltip title="Cmd+R">
            <span>
              <Button
                variant="contained"
                onClick={() => {
                  if (played) {
                    setGuardMsg('この単語は 1 回だけ再生されます')
                    window.setTimeout(() => setGuardMsg(null), 1400)
                  } else {
                    start()
                  }
                }}
                disabled={!canStart}
              >
                再生
              </Button>
            </span>
          </Tooltip>
        </Actions>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            autoFocus
            size="medium"
            placeholder="タイプして Enter で採点（採点後はCmd + Enterで次へ）"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e as any).metaKey) {
                e.preventDefault()
                e.stopPropagation()
                handleNext()
                return
              }
              if (e.key === 'Enter') {
                if (feedback.correct === null) submit()
              }
            }}
            inputProps={{ 'aria-keyshortcuts': 'Enter' }}
          />
        </Box>
      </Card>

      {feedback.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 1200,
            background: 'rgba(0,0,0,0.50)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '16px 20px',
              borderRadius: 8,
              backgroundColor: feedback.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              animation: `${pop} 360ms ease-out`,
              maxWidth: 600,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Typography variant="h4" sx={{ textShadow: '0 8px 30px rgba(125,211,252,0.25)' }}>
              {feedback.correct ? '正解！' : '不正解'}
            </Typography>
            <Typography variant="body2" sx={{ display: 'block', mt: 0.5, opacity: 0.95 }}>
              スペル: {feedback.answer}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
              <br />
              Cmd + Enterで次へ
            </Typography>
          </div>
        </div>
      )}
      {guardMsg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 1200,
            background: 'rgba(0,0,0,0.50)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              px: 3,
              py: 2,
              borderRadius: 2,
              bgcolor: 'rgba(125,211,252,0.15)',
              border: '1px solid rgba(255,255,255,0.15)',
              animation: `${pop} 360ms ease-out`,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
              margin: '0 auto',
            }}
          >
            {guardMsg}
          </Typography>
        </div>
      )}

      {/** Countdown overlay full screen with centered content to container width */}
      {countdown !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.50)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ maxWidth: 600, width: '100%', margin: '0 auto', textAlign: 'center' }}>
            <Countdown value={countdown} />
          </div>
        </div>
      )}
    </PageWrap>
  )
}
