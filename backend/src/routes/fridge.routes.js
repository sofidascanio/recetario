import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { fridgeItemSchema, updateFridgeItemSchema } from '../schemas/fridge.schemas.js'
import { z } from 'zod'
import * as fridgeController from '../controllers/fridge.controller.js'

const router = Router()

router.use(authenticate) // todas requieren auth

router.get('/', fridgeController.getFridge)
router.post('/', validate(fridgeItemSchema), fridgeController.addItem)
router.patch('/:itemId', validate(updateFridgeItemSchema), fridgeController.updateItem)
router.delete('/:itemId', fridgeController.deleteItem)

// ingredientes del catalogo
router.get('/ingredients/search', fridgeController.searchIngredients)
router.post('/ingredients',
    validate(z.object({ name: z.string().min(2).max(100).trim() })),
    fridgeController.createIngredient
)

export default router