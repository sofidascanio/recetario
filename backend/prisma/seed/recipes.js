import { Difficulty, Unit } from '@prisma/client'

export async function createRecipes(prisma, meals, users, ingredients) {
    console.log('Creando recetas...')

    const getMeal = (name) => meals.find(m => m.name === name)
    const getUser = (username) => users.find(u => u.username === username)

    const recipesData = [
        {
            title: 'Tortilla de Patatas Tradicional',
            description: 'La clásica tortilla española, jugosa por dentro y dorada por fuera.',
            imageUrl: 'https://cdn.pixabay.com/photo/2019/05/31/12/42/tortilla-4242357_640.jpg',
            difficulty: Difficulty.MEDIUM,
            prepTimeMinutes: 15,
            cookTimeMinutes: 25,
            servings: 4,
            tags: ['española', 'tradicional', 'vegetariana'],
            author: getUser('anacocina'),
            meal: getMeal('Tortilla de Patatas'),
            ingredients: [
                { ingredient: ingredients['Patata'], quantity: 4, unit: Unit.UNIT, notes: 'peladas y cortadas en láminas finas', order: 1 },
                { ingredient: ingredients['Huevo'], quantity: 6, unit: Unit.UNIT, notes: '', order: 2 },
                { ingredient: ingredients['Cebolla'], quantity: 1, unit: Unit.UNIT, notes: 'picada finamente (opcional)', order: 3 },
                { ingredient: ingredients['Aceite de oliva'], quantity: 200, unit: Unit.MILLILITER, notes: 'para freír', order: 4 },
                { ingredient: ingredients['Sal'], quantity: 1, unit: Unit.TO_TASTE, notes: 'al gusto', order: 5 },
            ],
            steps: [
                { order: 1, title: 'Preparar patatas', description: 'Pelar y cortar las patatas en láminas finas.', durationMin: 10 },
                { order: 2, title: 'Freír patatas y cebolla', description: 'Freír a fuego medio-bajo hasta que estén tiernas.', durationMin: 20 },
                { order: 3, title: 'Batir huevos', description: 'Batir los huevos con sal.', durationMin: 2 },
                { order: 4, title: 'Mezclar', description: 'Escurrir y mezclar con huevo. Reposar 5 minutos.', durationMin: 5 },
                { order: 5, title: 'Cuajar la tortilla', description: 'Cuajar en sartén y dar la vuelta.', durationMin: 8 },
            ],
        },
        {
            title: 'Spaghetti alla Carbonara',
            description: 'Receta italiana auténtica sin nata, solo huevo, queso y panceta.',
            imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/spaghetti-1238519_640.jpg',
            difficulty: Difficulty.EASY,
            prepTimeMinutes: 10,
            cookTimeMinutes: 15,
            servings: 2,
            tags: ['italiana', 'pasta', 'rápida'],
            author: getUser('chefjuan'),
            meal: getMeal('Pasta Carbonara'),
            ingredients: [
                { ingredient: ingredients['Huevo'], quantity: 2, unit: Unit.UNIT, notes: 'temperatura ambiente', order: 1 },
                { ingredient: ingredients['Queso parmesano'], quantity: 50, unit: Unit.GRAM, notes: 'recién rallado', order: 2 },
                { ingredient: ingredients['Panceta'], quantity: 100, unit: Unit.GRAM, notes: 'taquitos', order: 3 },
                { ingredient: ingredients['Ajo'], quantity: 1, unit: Unit.UNIT, notes: 'diente opcional', order: 4 },
            ],
            steps: [
                { order: 1, title: 'Cocer pasta', description: 'Cocer spaghetti en agua con sal.', durationMin: 10 },
                { order: 2, title: 'Preparar salsa', description: 'Batir huevos con queso y pimienta.', durationMin: 2 },
                { order: 3, title: 'Dorar panceta', description: 'Dorar panceta sin aceite.', durationMin: 5 },
                { order: 4, title: 'Mezclar', description: 'Mezclar pasta, panceta y salsa de huevo.', durationMin: 1 },
            ],
        },
        {
            title: 'Brownie de Chocolate Intenso',
            description: 'Brownie crujiente por fuera y tierno por dentro.',
            imageUrl: 'https://cdn.pixabay.com/photo/2019/02/22/18/58/brownie-4014098_640.jpg',
            difficulty: Difficulty.EASY,
            prepTimeMinutes: 15,
            cookTimeMinutes: 25,
            servings: 8,
            tags: ['dulce', 'chocolate', 'postre'],
            author: getUser('mariadulce'),
            meal: getMeal('Brownie de Chocolate'),
            ingredients: [
                { ingredient: ingredients['Chocolate negro'], quantity: 200, unit: Unit.GRAM, notes: '70% cacao', order: 1 },
                { ingredient: ingredients['Mantequilla'], quantity: 150, unit: Unit.GRAM, notes: 'temperatura ambiente', order: 2 },
                { ingredient: ingredients['Azúcar'], quantity: 200, unit: Unit.GRAM, notes: '', order: 3 },
                { ingredient: ingredients['Huevo'], quantity: 3, unit: Unit.UNIT, notes: '', order: 4 },
                { ingredient: ingredients['Harina de trigo'], quantity: 100, unit: Unit.GRAM, notes: '', order: 5 },
                { ingredient: ingredients['Sal'], quantity: 1, unit: Unit.PINCH, notes: '', order: 6 },
            ],
            steps: [
                { order: 1, title: 'Derretir', description: 'Derretir chocolate y mantequilla.', durationMin: 5 },
                { order: 2, title: 'Mezclar', description: 'Añadir azúcar y huevos uno a uno.', durationMin: 5 },
                { order: 3, title: 'Añadir harina', description: 'Tamizar harina y mezclar suavemente.', durationMin: 2 },
                { order: 4, title: 'Hornear', description: 'Hornear a 180°C por 20-25 minutos.', durationMin: 25 },
            ],
        },
        {
            title: 'Ensalada César Clásica',
            description: 'Con pollo, crutones y salsa César casera.',
            imageUrl: 'https://cdn.pixabay.com/photo/2017/02/15/10/39/salad-2068220_640.jpg',
            difficulty: Difficulty.MEDIUM,
            prepTimeMinutes: 20,
            cookTimeMinutes: 10,
            servings: 2,
            tags: ['ensalada', 'saludable', 'entrante'],
            author: getUser('anacocina'),
            meal: getMeal('Ensalada César'),
            ingredients: [
                { ingredient: ingredients['Pechuga de pollo'], quantity: 1, unit: Unit.UNIT, notes: 'a la plancha', order: 1 },
                { ingredient: ingredients['Lechuga'], quantity: 1, unit: Unit.UNIT, notes: 'tipo romana', order: 2 },
                { ingredient: ingredients['Queso parmesano'], quantity: 50, unit: Unit.GRAM, notes: 'laminado', order: 3 },
                { ingredient: ingredients['Huevo'], quantity: 1, unit: Unit.UNIT, notes: 'para salsa', order: 4 },
                { ingredient: ingredients['Ajo'], quantity: 1, unit: Unit.UNIT, notes: 'diente', order: 5 },
                { ingredient: ingredients['Limón'], quantity: 1, unit: Unit.UNIT, notes: 'jugo', order: 6 },
                { ingredient: ingredients['Aceite de oliva'], quantity: 100, unit: Unit.MILLILITER, notes: '', order: 7 },
            ],
            steps: [
                { order: 1, title: 'Preparar pollo', description: 'Cocinar pechuga a la plancha.', durationMin: 10 },
                { order: 2, title: 'Hacer crutones', description: 'Tostar cubos de pan con aceite.', durationMin: 5 },
                { order: 3, title: 'Salsa César', description: 'Licuar huevo, ajo, limón, queso y aceite.', durationMin: 5 },
                { order: 4, title: 'Montar', description: 'Mezclar lechuga, pollo, crutones, salsa y queso.', durationMin: 5 },
            ],
        },
        {
            title: 'Batido Energético de Frutos Rojos',
            description: 'Refrescante y antioxidante, ideal para el desayuno.',
            imageUrl: 'https://cdn.pixabay.com/photo/2016/02/10/15/47/smoothie-1191855_640.jpg',
            difficulty: Difficulty.EASY,
            prepTimeMinutes: 5,
            cookTimeMinutes: 0,
            servings: 2,
            tags: ['batido', 'vegano', 'rápido'],
            author: getUser('carlosverde'),
            meal: getMeal('Batido de Frutos Rojos'),
            ingredients: [
                { ingredient: ingredients['Fresas'], quantity: 100, unit: Unit.GRAM, notes: 'congeladas', order: 1 },
                { ingredient: ingredients['Arándanos'], quantity: 100, unit: Unit.GRAM, notes: 'congelados', order: 2 },
                { ingredient: ingredients['Yogur griego'], quantity: 150, unit: Unit.GRAM, notes: 'natural', order: 3 },
                { ingredient: ingredients['Leche'], quantity: 200, unit: Unit.MILLILITER, notes: 'vegetal opcional', order: 4 },
                { ingredient: ingredients['Miel'], quantity: 1, unit: Unit.TABLESPOON, notes: 'o sirope de agave', order: 5 },
            ],
            steps: [
                { order: 1, title: 'Licuar', description: 'Procesar todos los ingredientes.', durationMin: 2 },
                { order: 2, title: 'Servir', description: 'Verter en vasos.', durationMin: 1 },
            ],
        },
    ]

    const createdRecipes = []
    for (const rec of recipesData) {
        const recipe = await prisma.recipe.create({
            data: {
                title: rec.title,
                description: rec.description,
                imageUrl: rec.imageUrl,
                isPublic: true,
                difficulty: rec.difficulty,
                prepTimeMinutes: rec.prepTimeMinutes,
                cookTimeMinutes: rec.cookTimeMinutes,
                servings: rec.servings,
                tags: rec.tags,
                author: { connect: { id: rec.author.id } },
                meal: { connect: { id: rec.meal.id } },
                ingredients: {
                    create: rec.ingredients.map(ing => ({
                        quantity: ing.quantity,
                        unit: ing.unit,
                        notes: ing.notes,
                        order: ing.order,
                        ingredient: { connect: { id: ing.ingredient.id } }
                    }))
                },
                steps: {
                    create: rec.steps.map(step => ({
                        order: step.order,
                        title: step.title,
                        description: step.description,
                        durationMin: step.durationMin,
                    }))
                }
            }
        })
        createdRecipes.push(recipe)
    }

    return createdRecipes
}