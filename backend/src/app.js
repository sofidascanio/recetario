import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRouter from './routes/auth.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'
import recipeRouter from './routes/recipe.routes.js'
import commentRouter from './routes/comment.routes.js'
import fridgeRouter from './routes/fridge.routes.js'
import userRouter from './routes/user.routes.js'
import mealRouter from './routes/meal.routes.js'

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
app.use('/api/v1/recipes', recipeRouter)
app.use('/api/v1/recipes/:id/comments', commentRouter)
app.use('/api/v1/fridge', fridgeRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/meals', mealRouter)

// middleware de error global
app.use(errorHandler)

export default app