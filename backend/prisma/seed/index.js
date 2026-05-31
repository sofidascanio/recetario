import { seedUsers } from './users.js'
import { seedIngredients } from './ingredients.js'
import { seedMeals } from './meals.js'
import { seedRecipes } from './recipes.js'

export async function runSeed(prisma) {
    console.log('Iniciando seed...\n')

    const users = await seedUsers(prisma)
    console.log(`Usuarios: ${Object.keys(users).length} creados`)

    const ingredients = await seedIngredients(prisma)
    console.log(`Ingredientes: ${Object.keys(ingredients).length} creados`)

    const meals = await seedMeals(prisma)
    console.log(`Comidas: ${Object.keys(meals).length} creadas`)

    await seedRecipes(prisma, { users, ingredients, meals })
    console.log(`Recetas creadas`)

    console.log('\nSeed completado exitosamente.')
}