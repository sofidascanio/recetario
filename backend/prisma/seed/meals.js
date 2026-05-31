export async function seedMeals(prisma) {
    const mealsData = {
        pizza: {
            name: 'Pizza',
            category: 'DINNER',
        },
        empanadas: {
            name: 'Empanadas',
            category: 'APPETIZER',
        },
        milanesaNapolitana: {
            name: 'Milanesa a la napolitana',
            category: 'LUNCH',
        },
        risotto: {
            name: 'Risotto',
            category: 'DINNER',
        },
        tortillasEspanola: {
            name: 'Tortilla española',
            category: 'LUNCH',
        },
        medialunas: {
            name: 'Medialunas',
            category: 'BREAKFAST',
        },
        cheesecake: {
            name: 'Cheesecake',
            category: 'DESSERT',
        },
    }

    const entries = await Promise.all(
        Object.entries(mealsData).map(([key, data]) =>
        prisma.meal
            .upsert({ where: { name: data.name }, update: {}, create: data })
            .then((record) => [key, record])
        )
    )

    return Object.fromEntries(entries)
}