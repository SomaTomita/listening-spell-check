import cors from 'cors'
import express from 'express'
import apiRoutes from './routes'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', apiRoutes)

const PORT = 3001

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`)
})
