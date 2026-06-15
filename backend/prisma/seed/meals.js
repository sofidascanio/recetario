import { MealCategory } from '@prisma/client'

export async function createMeals(prisma) {
    console.log('Creando comidas...')

    const mealData = [
        { name: 'Pizza', category: MealCategory.LUNCH },
        { name: 'Ensalada César', category: MealCategory.APPETIZER },
        { name: 'Tortilla de Patatas', category: MealCategory.LUNCH },
        { name: 'Pasta Carbonara', category: MealCategory.LUNCH },
        { name: 'Brownie de Chocolate', category: MealCategory.DESSERT },
        { name: 'Batido de Frutos Rojos', category: MealCategory.DRINK },
        { name: 'Huevos Rancheros', category: MealCategory.BREAKFAST },
        { name: 'Ceviche', category: MealCategory.APPETIZER },
        { name: 'Risotto de Setas', category: MealCategory.DINNER },
        { name: 'Galletas de Avena', category: MealCategory.SNACK },
    ]

    const meals = []
    for (const data of mealData) {
        const meal = await prisma.meal.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        })
        meals.push(meal)
    }
    return meals
}