import cors from 'cors'
import express from 'express'
import apiRoutes from './routes.ts'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', apiRoutes)

const PORT = 3001

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`)
})
