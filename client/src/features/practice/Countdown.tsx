import { keyframes } from '@emotion/react'
import { Typography } from '@mui/material'

type Props = { value: number | null }

/**
 * Displays a large countdown value or an instruction note when null.
 */
export default function Countdown({ value }: Props) {
  if (value === null) return null
  const pop = keyframes`
    0% { transform: scale(0.6); opacity: 0; }
    60% { transform: scale(1.12); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  `
  return (
    <Typography
      variant="h2"
      sx={{
        textAlign: 'center',
        letterSpacing: 2,
        animation: `${pop} 420ms ease-out`,
        textShadow: '0 8px 30px rgba(125,211,252,0.35)',
      }}
    >
      {value}
    </Typography>
  )
}
