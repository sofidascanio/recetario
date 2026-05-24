import { z } from 'zod'

const ingredientSchema = z.object({
    ingredientId: z.string().min(1, 'ingredientId requerido'),
    quantity: z.number().positive('La cantidad debe ser igual o mayor a 0'),
    unit: z.enum([
        'GRAM', 'KILOGRAM', 'OUNCE', 'POUND',
        'MILLILITER', 'LITER', 'TEASPOON', 'TABLESPOON',
        'CUP', 'FLUID_OUNCE', 'UNIT', 'SLICE', 'PINCH', 'TO_TASTE',
    ]),
    notes: z.string().max(100).optional(),
    order: z.number().int().min(0).default(0),
})

const stepSchema = z.object({
    order: z.number().int().min(1),
    title: z.string().min(2).max(100),
    description: z.string().min(5),
    imageUrl: z.url().optional(),
    durationMin: z.number().int().positive().optional(),
})

export const createRecipeSchema = z.object({
    title: z.string().min(3, 'Mínimo 3 caracteres').max(100).trim(),
    description: z.string().min(10, 'Mínimo 10 caracteres').max(2000).trim(),
    mealId: z.string().min(1, 'mealId requerido'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
    prepTimeMinutes: z.number().int().positive(),
    cookTimeMinutes: z.number().int().min(0),
    servings: z.number().int().positive().default(2),
    isPublic: z.boolean().default(true),
    imageUrl: z.url().optional(),
    videoUrl: z.url().optional(),
    tags: z.array(z.string().toLowerCase().trim()).max(10).default([]),
    ingredients: z.array(ingredientSchema).min(1, 'Al menos un ingrediente'),
    steps: z.array(stepSchema).min(1, 'Al menos un paso'),
})

// para patch, todos los campos son opcionales
export const updateRecipeSchema = createRecipeSchema.partial()

export const listRecipesSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    category: z.enum([
        'BREAKFAST', 'LUNCH', 'DINNER',
        'SNACK', 'DESSERT', 'DRINK', 'APPETIZER',
    ]).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    search: z.string().trim().optional(),
    authorId: z.string().optional(),
    // "vegano,sin-gluten" -> split en el service
    tags: z.string().optional(),
    sortBy: z.enum(['recent', 'popular', 'rating']).default('recent'),
})

export const rateRecipeSchema = z.object({
    score: z.number().int().min(1).max(5),
})