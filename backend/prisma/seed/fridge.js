import { Unit } from '@prisma/client'
import { addDays } from './utils.js'

export async function createFridgeItems(prisma, users, ingredients) {
    console.log('Creando items de nevera...')

    const fridgeData = [
        { user: users[0], ingredient: ingredients['Huevo'], quantity: 6, unit: Unit.UNIT, expiresAt: addDays(10) },
        { user: users[0], ingredient: ingredients['Leche'], quantity: 1, unit: Unit.LITER, expiresAt: addDays(5) },
        { user: users[0], ingredient: ingredients['Tomate'], quantity: 3, unit: Unit.UNIT, expiresAt: addDays(3) },
        { user: users[1], ingredient: ingredients['Queso parmesano'], quantity: 200, unit: Unit.GRAM, expiresAt: addDays(20) },
        { user: users[1], ingredient: ingredients['Panceta'], quantity: 300, unit: Unit.GRAM, expiresAt: addDays(7) },
        { user: users[2], ingredient: ingredients['Mantequilla'], quantity: 250, unit: Unit.GRAM, expiresAt: addDays(30) },
        { user: users[2], ingredient: ingredients['Chocolate negro'], quantity: 150, unit: Unit.GRAM, expiresAt: addDays(60) },
        { user: users[3], ingredient: ingredients['Fresas'], quantity: 200, unit: Unit.GRAM, expiresAt: addDays(2) },
        { user: users[3], ingredient: ingredients['Yogur griego'], quantity: 500, unit: Unit.GRAM, expiresAt: addDays(8) },
    ]

    for (const item of fridgeData) {
        await prisma.fridgeItem.upsert({
            where: {
                userId_ingredientId: {
                    userId: item.user.id,
                    ingredientId: item.ingredient.id,
                },
            },
            update: {
                quantity: item.quantity,
                unit: item.unit,
                expiresAt: item.expiresAt,
            },
            create: {
                quantity: item.quantity,
                unit: item.unit,
                expiresAt: item.expiresAt,
                user: { connect: { id: item.user.id } },
                ingredient: { connect: { id: item.ingredient.id } },
            },
        })
    }
}