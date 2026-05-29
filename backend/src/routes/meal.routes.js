import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { mealSchema } from '../controllers/meal.controller.js'
import * as mealController from '../controllers/meal.controller.js'

const router = Router()
router.get('/', mealController.getMeals)
router.post('/', authenticate, validate(mealSchema), mealController.createMeal)
export default router