import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import PracticePage from './features/practice/PracticePage'

export default function App() {
  const [mode, setMode] = useState<'home' | 'practice'>('home')

  return (
    <Container maxWidth="sm">
      <Stack spacing={3} sx={{ py: 4 }}>
        {mode === 'home' ? (
          <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <Typography variant="h4" align="center">
              IELTS Listening - Spelling Practice
            </Typography>
            <Button variant="contained" size="large" onClick={() => setMode('practice')}>
              今すぐ練習
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">IELTS Listening - Spelling Practice</Typography>
              <Box sx={{ width: 64 }} />
            </Stack>
            <PracticePage />
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
