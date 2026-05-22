import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()

// headers http + logging
app.use(helmet())
app.use(morgan('dev'))

// parseo de body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// cors, solo frontend local
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))

// health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// rutas API
// app.use('/api/v1/recipes', recipesRouter)

// middleware de error global
app.use((err, _req, res, _next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    })
})

export default app