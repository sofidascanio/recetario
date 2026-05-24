import * as recipeService from '../services/recipe.service.js'
import { listRecipesSchema } from '../schemas/recipe.schemas.js'
import { ValidationError } from '../middlewares/error.middleware.js'

export async function createRecipe(req, res, next) {
    try {
        const recipe = await recipeService.createRecipe(req.user.id, req.body)
        res.status(201).json(recipe)
    } catch (err) { next(err) }
}

export async function listRecipes(req, res, next) {
    try {
        // valida query params con Zod
        const result = listRecipesSchema.safeParse(req.query)
        if (!result.success) {
            const errors = result.error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }))
            return next(new ValidationError('Parametros inválidos', errors))
        }

        const recipes = await recipeService.listRecipes(
            result.data,
            // puede ser undefined si no esta logueado
            req.user?.id
        )
        res.json(recipes)
    } catch (err) { next(err) }
}

export async function getRecipe(req, res, next) {
    try {
        const recipe = await recipeService.getRecipeById(
            req.params.id,
            req.user?.id
        )
        res.json(recipe)
    } catch (err) { next(err) }
}

export async function updateRecipe(req, res, next) {
    try {
        const recipe = await recipeService.updateRecipe(
            req.params.id,
            req.user.id,
            req.body
        )
        res.json(recipe)
    } catch (err) { next(err) }
    }

export async function deleteRecipe(req, res, next) {
    try {
        await recipeService.deleteRecipe(req.params.id, req.user.id)
        res.status(204).send()
    } catch (err) { next(err) }
}

export async function saveRecipe(req, res, next) {
    try {
        await recipeService.saveRecipe(req.params.id, req.user.id)
        res.status(201).json({ message: 'Receta guardada' })
    } catch (err) { next(err) }
}

export async function unsaveRecipe(req, res, next) {
    try {
        await recipeService.unsaveRecipe(req.params.id, req.user.id)
        res.status(204).send()
    } catch (err) { next(err) }
}

export async function rateRecipe(req, res, next) {
    try {
        const result = await recipeService.rateRecipe(
            req.params.id,
            req.user.id,
            req.body.score
        )
        res.json(result)
    } catch (err) { next(err) }
}

export async function getFridgeMatch(req, res, next) {
    try {
        const result = await recipeService.getFridgeMatch(req.user.id)
        res.json(result)
    } catch (err) { next(err) }
}