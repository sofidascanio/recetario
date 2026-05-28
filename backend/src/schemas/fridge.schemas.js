import { z } from 'zod'

export const fridgeItemSchema = z.object({
    ingredientId: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.enum([
        'GRAM','KILOGRAM','OUNCE','POUND',
        'MILLILITER','LITER','TEASPOON','TABLESPOON',
        'CUP','FLUID_OUNCE','UNIT','SLICE','PINCH','TO_TASTE',
    ]),
    expiresAt: z.iso.datetime().optional().nullable(),
})

export const updateFridgeItemSchema = fridgeItemSchema.partial()