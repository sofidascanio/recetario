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

// requiere auth
// va antes que la /:id porque sino express lo toma mal
router.get('/fridge-match', authenticate, recipeController.getFridgeMatch)

// rutas publicas (con mas data si hay token)
router.get('/', optionalAuth, recipeController.listRecipes)
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

// favoritos
router.post('/:id/save', authenticate, recipeController.saveRecipe)
router.delete('/:id/save', authenticate, recipeController.unsaveRecipe)

// rating
router.post(
    '/:id/rate',
    authenticate,
    validate(rateRecipeSchema),
    recipeController.rateRecipe
)

export default router