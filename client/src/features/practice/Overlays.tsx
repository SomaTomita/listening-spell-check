import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Box, Typography } from '@mui/material'
import Countdown from './Countdown'

const pop = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const Backdrop = styled('div')`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* block clicks */
`

const CenterBox = styled('div')`
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
`

export function ResultOverlay(props: { correct: boolean | null; answer?: string }) {
  if (props.correct === null) return null
  return (
    <Backdrop>
      <CenterBox>
        <Box
          sx={{
            textAlign: 'center',
            p: '16px 20px',
            borderRadius: 2,
            bgcolor: props.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            animation: `${pop} 360ms ease-out`,
          }}
        >
          <Typography variant="h4" sx={{ textShadow: '0 8px 30px rgba(125,211,252,0.25)' }}>
            {props.correct ? '正解！' : '不正解'}
          </Typography>
          {props.answer && (
            <Typography variant="body2" sx={{ display: 'block', mt: 0.5, opacity: 0.95 }}>
              スペル: {props.answer}
            </Typography>
          )}
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
            Cmd + Enterで次へ
          </Typography>
        </Box>
      </CenterBox>
    </Backdrop>
  )
}

export function GuardOverlay(props: { message: string }) {
  return (
    <Backdrop>
      <CenterBox>
        <Typography
          variant="h5"
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            bgcolor: 'rgba(125,211,252,0.15)',
            border: '1px solid rgba(255,255,255,0.15)',
            animation: `${pop} 360ms ease-out`,
          }}
        >
          {props.message}
        </Typography>
      </CenterBox>
    </Backdrop>
  )
}

export function CountdownScreen(props: { value: number }) {
  return (
    <Backdrop>
      <CenterBox>
        <Countdown value={props.value} />
      </CenterBox>
    </Backdrop>
  )
}
