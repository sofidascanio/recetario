export async function createSocialInteractions(prisma, users, recipes) {
    console.log('Creando comentarios, ratings y favoritos...')

    const ratingsData = [
        { user: users[0], recipe: recipes[1], score: 5 },
        { user: users[0], recipe: recipes[2], score: 4 },
        { user: users[1], recipe: recipes[0], score: 5 },
        { user: users[1], recipe: recipes[3], score: 4 },
        { user: users[2], recipe: recipes[2], score: 5 },
        { user: users[3], recipe: recipes[4], score: 4 },
        { user: users[3], recipe: recipes[0], score: 5 },
    ]

    for (const r of ratingsData) {
        await prisma.rating.upsert({
            where: {
                userId_recipeId: {
                    userId: r.user.id,
                    recipeId: r.recipe.id,
                },
            },
            update: { score: r.score },
            create: {
                score: r.score,
                user: { connect: { id: r.user.id } },
                recipe: { connect: { id: r.recipe.id } },
            },
        })
    }

    const commentsData = [
        { user: users[1], recipe: recipes[0], content: 'Me ha quedado espectacular, gracias por la receta.' },
        { user: users[2], recipe: recipes[2], content: 'El mejor brownie que he probado.' },
        { user: users[0], recipe: recipes[1], content: '¿Se puede sustituir la panceta por bacon ahumado?' },
        { user: users[3], recipe: recipes[3], content: 'Muy fresca y ligera, perfecta para el verano.' },
        { user: users[0], recipe: recipes[4], content: 'Lo hago cada mañana, súper energético.' },
    ]

    for (const c of commentsData) {
        await prisma.comment.create({
            data: {
                content: c.content,
                author: { connect: { id: c.user.id } },
                recipe: { connect: { id: c.recipe.id } },
            },
        })
    }

    const savesData = [
        { user: users[0], recipe: recipes[1] },
        { user: users[1], recipe: recipes[0] },
        { user: users[2], recipe: recipes[2] },
        { user: users[3], recipe: recipes[4] },
        { user: users[0], recipe: recipes[4] },
    ]

    for (const s of savesData) {
        await prisma.savedRecipe.upsert({
            where: {
                userId_recipeId: {
                    userId: s.user.id,
                    recipeId: s.recipe.id,
                },
            },
            update: {},
            create: {
                user: { connect: { id: s.user.id } },
                recipe: { connect: { id: s.recipe.id } },
            },
        })
    }
}