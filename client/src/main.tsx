import { Global, css } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { theme } from './theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Global
        styles={css`
          html,
          body,
          #root {
            height: 100%;
          }
          body {
            background:
              radial-gradient(1000px 600px at 50% -200px, rgba(125, 211, 252, 0.12), transparent),
              radial-gradient(800px 400px at 100% 0, rgba(167, 139, 250, 0.12), transparent),
              #0b0e13;
          }
          *:focus-visible {
            outline: 2px solid #7dd3fcaa;
            outline-offset: 2px;
          }
        `}
      />
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
