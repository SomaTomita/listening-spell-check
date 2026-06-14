import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import HomePage from './features/home/HomePage';
import PracticePage from './features/practice/PracticePage';

export default function App() {
  const [mode, setMode] = useState<'home' | 'practice'>('home');

  return (
    <Container maxWidth='sm'>
      <Stack spacing={3} sx={{ py: 4 }}>
        {mode === 'home' ? (
          <HomePage onStart={() => setMode('practice')} />
        ) : (
          <Stack spacing={2}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Button variant='text' onClick={() => setMode('home')}>
                ← Home
              </Button>
              <Typography variant='h5'>IELTS Listening - Spelling Practice</Typography>
              <Box sx={{ width: 64 }} />
            </Stack>
            <PracticePage />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
