import { Router } from 'express'
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
    createRecipeSchema,
    updateRecipeSchema,
    rateRecipeSchema,
} from '../schemas/recipe.schemas.js'
import * as recipeController from '../controllers/recipe.controller.js'

const router = Router()

// va antes que /:id porque sino express lo interpreta como id
router.get('/fridge-match', authenticate, recipeController.getFridgeMatch)

router.get('/',    optionalAuth, recipeController.listRecipes)
router.get('/:id', optionalAuth, recipeController.getRecipe)

router.post(
    '/',
    authenticate,
    validate(createRecipeSchema),
    recipeController.createRecipe
)

router.patch(
    '/:id',
    authenticate,
    validate(updateRecipeSchema),
    recipeController.updateRecipe
)

router.delete('/:id', authenticate, recipeController.deleteRecipe)

// toggle unificado, post guarda si no estaba, quita si ya estaba
// devuelve { saved: boolean }
router.post('/:id/save',   authenticate, recipeController.toggleSave)
router.delete('/:id/save', authenticate, recipeController.unsaveRecipe)

router.post(
    '/:id/rate',
    authenticate,
    validate(rateRecipeSchema),
    recipeController.rateRecipe
)

export default router