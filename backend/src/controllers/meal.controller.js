import * as mealService from '../services/meal.service.js'
import { z } from 'zod'
import { validate } from '../middlewares/validate.middleware.js'

const mealSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    category: z.enum(['BREAKFAST','LUNCH','DINNER','SNACK','DESSERT','DRINK','APPETIZER']),
})

// GET /api/v1/meals?category=DINNER
// El query param category es opcional, si no viene, devuelve todas
export async function getMeals(req, res, next) {
    try {
        const { category } = req.query
        res.json(await mealService.getMeals({ category }))
    } catch (err) { next(err) }
}

export async function createMeal(req, res, next) {
    try {
        const { name, category } = req.body
        res.status(201).json(await mealService.createMeal(name, category))
    } catch (err) { next(err) }
}

export { mealSchema }