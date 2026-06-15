export async function createIngredients(prisma) {
    console.log('Creando ingredientes...')

    const ingredientList = [
        'Harina de trigo', 'Huevo', 'Tomate', 'Lechuga', 'Queso parmesano',
        'Pechuga de pollo', 'Aceite de oliva', 'Sal', 'Pimienta', 'Ajo',
        'Cebolla', 'Patata', 'Panceta', 'Nata líquida', 'Chocolate negro',
        'Mantequilla', 'Azúcar', 'Leche', 'Fresas', 'Arándanos',
        'Yogur griego', 'Limón', 'Pescado blanco', 'Arroz arborio', 'Setas',
        'Avena', 'Miel', 'Vinagre balsámico', 'Mostaza', 'Caldo de verduras',
    ]

    const ingredients = {}
    for (const name of ingredientList) {
        const ingredient = await prisma.ingredient.upsert({
            where: { name },
            update: {},
            create: { name },
        })
        ingredients[name] = ingredient
    }
    return ingredients
}