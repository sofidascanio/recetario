import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // crear ingredientes base
  const harina = await prisma.ingredient.upsert({
    where: { name: 'Harina 000' },
    update: {},
    create: { name: 'Harina 000' },
  })

  const huevo = await prisma.ingredient.upsert({
    where: { name: 'Huevo' },
    update: {},
    create: { name: 'Huevo' },
  })

  // crear una comida
  const pizza = await prisma.meal.upsert({
    where: { name: 'Pizza Margherita' },
    update: {},
    create: {
      name: 'Pizza Margherita',
      category: 'DINNER',
    },
  })

  // crear un usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'test@recetario.com' },
    update: {},
    create: {
      email: 'test@recetario.com',
      username: 'testuser',
      displayName: 'Usuario de Prueba',
      passwordHash: 'placeholder',
    },
  })

  // crear una receta completa
  const recipe = await prisma.recipe.create({
    data: {
      title: 'Pizza Margherita Clásica',
      description: 'La pizza más simple y deliciosa.',
      difficulty: 'MEDIUM',
      prepTimeMinutes: 30,
      cookTimeMinutes: 15,
      servings: 4,
      tags: ['italiana', 'vegetariana'],
      authorId: user.id,
      mealId: pizza.id,
      ingredients: {
        create: [
          { ingredientId: harina.id, quantity: 500, unit: 'GRAM', order: 1 },
          { ingredientId: huevo.id, quantity: 1, unit: 'UNIT', order: 2 },
        ],
      },
      steps: {
        create: [
          { order: 1, title: 'Preparar la masa', description: 'Mezclar harina con agua y levadura.' },
          { order: 2, title: 'Hornear', description: 'Hornear a 250°C por 15 minutos.' },
        ],
      },
    },
  })

  console.log('Seed completado:', { user: user.username, recipe: recipe.title })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())