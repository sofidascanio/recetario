export async function cleanDatabase(prisma) {
    console.log('Limpiando base de datos...')

    await prisma.notification.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.rating.deleteMany()
    await prisma.savedRecipe.deleteMany()
    await prisma.recipeIngredient.deleteMany()
    await prisma.recipeStep.deleteMany()
    await prisma.fridgeItem.deleteMany()
    await prisma.follow.deleteMany()
    await prisma.recipe.deleteMany()
    await prisma.ingredient.deleteMany()
    await prisma.meal.deleteMany()
    await prisma.user.deleteMany()

    console.log('Limpieza completada')
}