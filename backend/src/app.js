import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRouter from './routes/auth.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'

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
app.use('/api/v1/auth', authRouter)

// middleware de error global
app.use(errorHandler)

export default app