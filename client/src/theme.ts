import { createTheme } from '@mui/material';

// Centralized MUI theme. Tuned for better contrast, rounded corners, and subtle elevation.
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7dd3fc' }, // sky-300
    secondary: { main: '#a78bfa' }, // violet-400
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
