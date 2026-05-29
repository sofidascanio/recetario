import * as mealService from '../services/meal.service.js'
import { z } from 'zod'
import { validate } from '../middlewares/validate.middleware.js'

const mealSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    category: z.enum(['BREAKFAST','LUNCH','DINNER','SNACK','DESSERT','DRINK','APPETIZER']),
})

export async function getMeals(req, res, next) {
    try {
        res.json(await mealService.getMeals())
    } catch (err) { next(err) }
}

export async function createMeal(req, res, next) {
    try {
        const { name, category } = req.body
        res.status(201).json(await mealService.createMeal(name, category))
    } catch (err) { next(err) }
}

export { mealSchema }