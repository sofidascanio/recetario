import { Router } from 'express'
import { optionalAuth } from '../middlewares/auth.middleware.js'
import * as userController from '../controllers/user.controller.js'

const router = Router()

router.get('/:username', optionalAuth, userController.getProfile)
router.get('/:username/recipes', optionalAuth, userController.getUserRecipes)

export default router