import { cleanDatabase } from './clean.js'
import { createMeals } from './meals.js'
import { createIngredients } from './ingredients.js'
import { createUsers } from './users.js'
import { createRecipes } from './recipes.js'
import { createSocialInteractions } from './social.js'
import { createFridgeItems } from './fridge.js'
import { createFollowsAndNotifications } from './follows-notifications.js'

export async function runSeed(prisma) {
    console.log('Iniciando seed...')

    await cleanDatabase(prisma)

    const meals = await createMeals(prisma)
    const ingredients = await createIngredients(prisma)
    const users = await createUsers(prisma)
    const recipes = await createRecipes(prisma, meals, users, ingredients)
    await createSocialInteractions(prisma, users, recipes)
    await createFridgeItems(prisma, users, ingredients)
    await createFollowsAndNotifications(prisma, users, recipes)

    console.log('Seed completado exitosamente')
}