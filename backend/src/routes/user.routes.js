import { Router } from 'express'
import { optionalAuth } from '../middlewares/auth.middleware.js'
import * as userController from '../controllers/user.controller.js'
import { updateProfileSchema } from '../schemas/user.schemas.js'
import { validate } from '../middlewares/validate.middleware.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/:username', optionalAuth, userController.getProfile)
router.get('/:username/recipes', optionalAuth, userController.getUserRecipes)

router.patch(
    '/me',
    authenticate,
    validate(updateProfileSchema),
    userController.updateProfile
)

export default router