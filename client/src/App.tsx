import { Box, Button, Container, Stack, Typography } from '@mui/material'

export default function App() {

  return (
    <Container maxWidth="sm">
      <Stack spacing={3} sx={{ py: 6 }}>
        <Typography variant="h4">IELTS Spelling Practice</Typography>
        <Box>
          <Button variant="contained" size="large">今すぐ練習</Button>
        </Box>
      </Stack>
    </Container>
  )
}

