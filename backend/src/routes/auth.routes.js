import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.get('/me', authenticate, authController.getMe)

export default router